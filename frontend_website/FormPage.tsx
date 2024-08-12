import React, { useState, useEffect } from "react";
import { Button, Container, Box } from "@mui/material";
import "./FormPageStyles.css";
import { BACKENDIPFORMANUALRESPONSE } from "./settings";
import axios from "axios";
import {
  handleChangeToContent,
  regenerateResponse,
  handleSaving,
  formatHTML,
  _convertResponseIntoHtml
} from "./commonFunctions";
import DOMPurify from "dompurify";

const FormPage = () => {
  const [formData, setFormData] = useState({
    cve_id: "",
    cve_description: "",
    cvss_v3_score: "",
    cve_potential_exploit: "",
    products_versions_affected: "",
    mitigation_strategies: "",
    more_info: "",
  });
  const DEFAULTMESSAGE = "<p>Fetching response from LLM...</p>";
  const [webContent, setWebContent] = useState(DEFAULTMESSAGE);
  const [regenerateFlag, setRegenerateFlag] = useState(false); //used to indicate whether a response needs to be refetched
  const [isContentLoaded, setIsContentLoaded] = useState(false); // used to indicate whether content has been loaded from backend
  const [editedContent, setEditedContent] = useState(DEFAULTMESSAGE);
  const [isEditingContent, setIsEditingContent] = useState(false);
  //almost identical to results page except for 1 more state, which allow for the editing of fields and then resubmission
  const [isEditingForm, setIsEditingForm] = useState(true); //if this is true we enable the user to edit the form
  useEffect(() => {
    if (!isContentLoaded && regenerateFlag) {
      //form-data should be sent as content has not been loaded yet
      _sendRequestToLLM(formData); //will reset the web content
    }
  }, [regenerateFlag]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const _sendRequestToLLM = async (formData) => {
    //send a request to the backend, then refetch the page's content
    try {
      const request = await axios.post(
        BACKENDIPFORMANUALRESPONSE,
        {
          cve_id: formData.cve_id,
          cve_description: formData.cve_description,
          cvss_v3_score: formData.cvss_v3_score,
          cve_potential_exploit: formData.cve_potential_exploit,
          products_versions_affected: formData.products_versions_affected,
          mitigation_strategies: formData.mitigation_strategies,
          more_info: formData.more_info,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const LLMResponse = formatHTML(_convertResponseIntoHtml(request.data));
      const sanitizedContent = DOMPurify.sanitize(LLMResponse);
      setWebContent(sanitizedContent); //vary this according to the API's result JSON format
      setIsContentLoaded(true); //we put this state change here because of this function's async nature, 
      setRegenerateFlag(false);
    } catch (error) {
      console.error("Error fetching data from backend: ", error);
      setWebContent(
        formatHTML("<p>Failed to fetch response from backend</p><p>Please refresh the page or check that the server flask file is running</p>")
      );
      }
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    setIsEditingForm(false);
    setWebContent(DEFAULTMESSAGE);
    setIsContentLoaded(false); //this is to prevent the regenerate result button from showing during iniital fetching of results
    await _sendRequestToLLM(formData);
  };

  return (
    <div>
      {
        isEditingForm ? (
          <Container
            maxWidth="xl"
            disableGutters
            sx={{ justifySelf: "flex-start" }}
          >
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <label htmlFor="cve_id" className="form-id">
                  CVE ID:
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="cve_id"
                  name="cve_id"
                  value={formData.cve_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cve_description" className="form-id">
                  CVE Description:
                </label>
                <textarea
                  className="form-textarea"
                  id="cve_description"
                  name="cve_description"
                  value={formData.cve_description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvss_v3_score" className="form-id">
                  CVSS v3 Score:
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="cvss_v3_score"
                  name="cvss_v3_score"
                  value={formData.cvss_v3_score}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cve_potential_exploit" className="form-id">
                  What would happen if the CVE is exploited?
                </label>
                <textarea
                  className="form-textarea"
                  id="cve_potential_exploit"
                  name="cve_potential_exploit"
                  value={formData.cve_potential_exploit}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="products_versions_affected" className="form-id">
                  Products/Versions Affected by the CVE:
                </label>
                <textarea
                  className="form-textarea"
                  id="products_versions_affected"
                  name="products_versions_affected"
                  value={formData.products_versions_affected}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="mitigation_strategies" className="form-id">
                  Mitigation Strategies:
                </label>
                <textarea
                  className="form-textarea"
                  id="mitigation_strategies"
                  name="mitigation_strategies"
                  value={formData.mitigation_strategies}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="more_info" className="form-id">
                  Links to more information on the CVE:
                </label>
                <textarea
                  className="form-textarea"
                  id="more_info"
                  name="more_info"
                  value={formData.more_info}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onSubmit={handleSubmit} //important to use onSubmit here, as the required prop will break otherwise
              >
                Submit
              </Button>
            </form>
          </Container>
        ) : isEditingContent ? (
          <div className="webContent-div">
            <textarea
              value={editedContent}
              onChange={(e) => handleChangeToContent(e, setEditedContent)}
              rows="30"
              cols="140"
            ></textarea>
            <br />
            <Button
              variant="contained"
              onClick={() =>
                handleSaving(setIsEditingContent, setWebContent, editedContent)
              }
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="webContent-div" >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <p style={{ margin: "0 70% 0 0" }}>{formData.cve_id}</p>
              {(isEditingContent || !isContentLoaded) ? (<div></div>): (
                  <Button
                  variant="outlined"
                  onClick={() => {
                    regenerateResponse(
                      setRegenerateFlag,
                      setIsContentLoaded,
                      setWebContent,
                      DEFAULTMESSAGE
                    );
                  }
                  }
                  >
                  Regenerate result
                </Button>
                )}
              </Box>
            <div
              dangerouslySetInnerHTML={{ __html: webContent }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setIsEditingContent(true);
                setEditedContent(webContent);
              }}
              sx={{ marginTop: 3}}
            >
              Edit content
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsEditingForm(true);
              }}
              sx={{ marginTop: 3, marginLeft: "2rem" }}
            >
              Edit form
            </Button>
          </div>
        )
      }
    </div>
  );
};
export default FormPage;
