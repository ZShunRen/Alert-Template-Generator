export const GODWATCHFLASKPORT = 105 //tentative
export const BACKENDIP = import.meta.env.VITE_WEBSITE_BASE_URL; //changed to local docker host to allow users to connect based on the current host of docker container's ip
export const BACKENDIPFORAUTOMATEDRESPONSE = `${BACKENDIP}:${GODWATCHFLASKPORT}/fetchLLMResponse`
// export const BACKENDIPFORMANUALRESPONSE = `${BACKENDIP}:${GODWATCHFLASKPORT}` //for now using the LLM docker container's IP instead of routing through backend
export const BACKENDIPFORMANUALRESPONSE = `${BACKENDIP}:${GODWATCHFLASKPORT}/generate/manual` //for now using the LLM docker container's IP instead of routing through backend