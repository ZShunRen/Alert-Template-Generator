import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button } from "@mui/material";
import DOMPurify from "dompurify";
import axios from "axios";
import "./ResultsPage.css";
import { BACKENDIPFORAUTOMATEDRESPONSE } from "./settings";
import {
  handleChangeToContent,
  regenerateResponse,
  handleSaving,
  formatHTML,
  _convertResponseIntoHtml
} from "./commonFunctions";
async function getLLMResultFromDB(cve_id, isRetrieving) {
  //isRetrieving indicates whether the request is to pull the existing llm generation, or to force the llm to regenerate another entry
  //Can be helpful if generated result is not good
  const request = await axios.post(BACKENDIPFORAUTOMATEDRESPONSE, {
    cve_id: cve_id,
    isRetrieving: isRetrieving,
  });
  return request.data;
}
const DEFAULTMESSAGE = "<p>Fetching response from LLM...</p>";

function ResultsPage() {
  const { cve_id } = useParams();
  const [webContent, setWebContent] = useState(DEFAULTMESSAGE);
  const [isContentLoaded, setIsContentLoaded] = useState(false); //the flag that will cause a regeneration of the response if the user does not like the generated result
  const [regenerateFlag, setRegenerateFlag] = useState(false); //used to indicate whether a response needs to be refetched
  const [isEditingContent, setisEditingContent] = useState(false);
  const [isFirstTimeRunningFlag, setIsFirstTimeRunningFlag] = useState(true);
  const [editedContent, setEditedContent] = useState("");

  const fetchLLMResponse = async (cve_id, flag) => {
    try {
      const unformattedResponse = (await getLLMResultFromDB(cve_id, flag)).response;
      let response =
        typeof unformattedResponse == "object"
          ? unformattedResponse[0]
          : unformattedResponse;
      response = formatHTML(_convertResponseIntoHtml(response));
      const sanitizedContent = DOMPurify.sanitize(response);
      setWebContent(sanitizedContent);
    } catch (error) {
      console.error("Error fetching data from backend: ", error);
      setWebContent(
        "Failed to fetch response from backend, please refresh the page or check that the server flask file is running. Otherwise, the database is missing this CVE entry."
      );
      if (!isFirstTimeRunningFlag) {
        setWebContent(
          "Failed to fetch response from LLM, please try to generate the response again or check that the LLM is running."
        );
      }
    }
  };

  const fetchCachedLLMResponse = async (cve_id) => {
    //will send the flag == true, i.e. to fetch the cached response if it exists
    await fetchLLMResponse(cve_id, true);
    setIsFirstTimeRunningFlag(false);
    setIsContentLoaded(true);
  };

  const fetchNewLLMResponse = async (cve_id) => {
    setIsContentLoaded(false);
    await fetchLLMResponse(cve_id, false);
    setRegenerateFlag(false); //reset back
    setIsContentLoaded(true); //we put this state change here because of this function's async nature
  };

  useEffect(() => {
    if ( !regenerateFlag && isFirstTimeRunningFlag) {
      fetchCachedLLMResponse(cve_id);
    } else if (regenerateFlag && !isFirstTimeRunningFlag) {
      fetchNewLLMResponse(cve_id);
    }
  }, [regenerateFlag]);
  useEffect(() => {
    if (!isFirstTimeRunningFlag) {
      setWebContent(editedContent);
    }
  }, [isEditingContent]);

  return (
    <div className="ResultsPage">
      <main className="main">
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: "0 70% 0 0" }}>{cve_id}</p>
          {(isEditingContent || !isContentLoaded) ? (<div></div>): (
            <Button
            variant="outlined"
            onClick={() =>
              regenerateResponse(
                setRegenerateFlag,
                setIsContentLoaded,
                setWebContent,
                DEFAULTMESSAGE
              )
            }
            >
            Regenerate result
          </Button>
          )}
        </Box>

        <div className="content">
          <div className="main-content">
            {(isEditingContent) ? (
              <div>
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
                    handleSaving(setisEditingContent, setWebContent, editedContent)
                  }
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <div>
                <div
                  dangerouslySetInnerHTML={{ __html: webContent }}
                  style={{ marginLeft: "1rem" }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setisEditingContent(true);
                    setEditedContent(webContent);
                  }}
                  sx={{ marginTop: 3 }}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResultsPage;
