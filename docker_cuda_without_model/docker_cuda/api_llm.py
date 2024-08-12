import bleach
from flask import Flask, request
from llm_config import MODEL_PATH, CONTEXT_SIZE, MAX_TOKENS, TEMPERATURE, TOP_P, ECHO, STOP, N_GPU_LAYERS
import llama_cpp
import re
import threading
from waitress import serve
app = Flask(__name__)
llama3_llm = llama_cpp.Llama(model_path= MODEL_PATH, n_gpu_layers= N_GPU_LAYERS, n_ctx = CONTEXT_SIZE)
ALLOWED_TAGS = []
HUGGINGFACETOKEN = None #set here for the llm to display info on input and output token length for debugging
INTERNAL_PORT_NUMBER = 80 #NOT the port number we connect to, check dockerfile for port number which is accessible from outside docker container
model_lock = threading.Lock()
def generate_text_from_prompt(user_prompt, max_tokens = MAX_TOKENS, temperature = TEMPERATURE, top_p = TOP_P, echo = ECHO, stop = STOP):
    #provides default values in llm_config.py
    with model_lock:
        model_output = llama3_llm(prompt= user_prompt,
                                  max_tokens= max_tokens,
                                  temperature= temperature,
                                  top_p = top_p,
                                  echo = echo,
                                  stop = stop
                                )
    return model_output

def sanitize_input(data): 
    #2 step process, 
    # 1. sanitizing for regex (only allowed chars), 
    # 2. removing any html tags 
    bleached_data = bleach.clean(data)
    pattern = re.compile(r'[^a-zA-Z0-9\s@.,!?-`/]')
    cleaned_input = pattern.sub('', bleached_data)
    return cleaned_input

# def get_number_of_tokens(input) :
#     tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B", token = HUGGINGFACETOKEN)
#     tokens = tokenizer.tokenize(input)
#     return len(tokens)

@app.route("/generate_template", methods = ["POST", "GET"])
def generate_article_template():
    #1. Takes in form data from a post request
    #2. Sanitizes input
    #3. Generates a response and sends it back to user
    #4. If hugging face token is specified above, will also print out the length of input and response tokens
    template_prompt = "Use the following json-format data to write an article of no more than 5 paragraphs on the specified CVE, to a general audience in the following format. Add ` between every product/version affected by the vulnerability and between every link.: (1) CVE description, including CVSSv3 score. (2) Impact of potential successful exploitation. (3) Products and Versions affected, with product numbers. (4)Mitigation Strategies. (5) Links to more information"
    possible_cve_description = request.form.get("cve_description")
    possible_cvss_v3_score = request.form.get("cvss_v3_score")
    possible_cve_potential_exploit = request.form.get("cve_potential_exploit")
    possible_products_versions_affected = request.form.get("products_versions_affected")
    possible_mitigation_strategies = request.form.get("mitigation_strategies")
    possible_more_info = request.form.get("more_info")
    if possible_mitigation_strategies == '':
        possible_mitigation_strategies = "Users and administrators are advised to update to the latest versions of any affected software and to visit the vendors' websites for more information."
    if (possible_cve_description):
        possible_cve_description = sanitize_input(possible_cve_description)
    if (possible_cvss_v3_score):
        possible_cvss_v3_score = sanitize_input(possible_cvss_v3_score)
    if (possible_cve_potential_exploit):
        possible_cve_potential_exploit = sanitize_input(possible_cve_potential_exploit)
    if (possible_products_versions_affected):
        possible_products_versions_affected = sanitize_input(possible_products_versions_affected)
    if (possible_mitigation_strategies):
        possible_mitigation_strategies = sanitize_input(possible_mitigation_strategies)
    if (possible_more_info):
        possible_more_info = possible_more_info
    json_data = {
        "cve_description": possible_cve_description, 
        "cvss_v3_score": possible_cvss_v3_score, 
        "cve_potential_exploit":possible_cve_potential_exploit, 
        "products_versions_affected": possible_products_versions_affected,
        "mitigation_strategies": possible_mitigation_strategies,
        "more_info":possible_more_info
    }    
    user_prompt = f"{template_prompt}: `{str(json_data)}`. Output here:"
    # if (HUGGINGFACETOKEN != None):
        # try:
            # print(f"Number of tokens in your text: {get_number_of_tokens(user_prompt)}")
        # except:
            # print("Invalid or missing hugging face token, please specify in settings to check user prompt & response length")
    intermediate = generate_text_from_prompt(user_prompt = user_prompt)
    print("output:")
    print(intermediate)
    result = intermediate['choices'][0]["text"]
    print(result)
    # if (HUGGINGFACETOKEN != None):
        # try:
            # print(f"length of response token : {get_number_of_tokens(result)}")
        # except:
            # print("Invalid or missing hugging face token, please specify in settings to check user prompt & response length")
    return result

#p
if __name__ == "__main__":
    # app.run(host = "0.0.0.0", port= INTERNAL_PORT_NUMBER, debug = True)    
    serve(app, host= '0.0.0.0', port = INTERNAL_PORT_NUMBER)
    #possible cause of problem being cors