import React, { useState, useRef } from "react";
import { Button, Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
function handleChangeToCVEInput(e, setIsEntryForCVEIDInvalidHook, isFirstTimeInputtingCVE) {
    const { value } = e.target;
    if (!isFirstTimeInputtingCVE) {
        _validateInput(value, setIsEntryForCVEIDInvalidHook);
    }
}

function _validateInput(value, setIsEntryForCVEIDInvalidHook) {
    //helper func to check if CVE-ID is valid
    const regexForCVE = /^CVE-\d{4}-\d+$/
    if (regexForCVE.test(value)) {
        setIsEntryForCVEIDInvalidHook(false);
        return true; //reflect the input is valid
    } else {
        console.log("invalid input");
        setIsEntryForCVEIDInvalidHook(true);
        return false;
    }   
}


export default function FrontPage() {
    const [isEntryForCVEIDInvalid, setIsEntryForCVEIDInvalid] = useState(false);
    const [isFirstTimeInputtingCVE, setIsFirstTimeInputtingCVE] = useState(true);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    function handleOnClick() {
        const textValue = inputRef.current.value;
        //button that will navigate to the next uri
        if (_validateInput(textValue, setIsEntryForCVEIDInvalid)) { //tried using the state, but state updates are async
            navigate(`/CVE/${textValue}`);

        } else {
            setIsFirstTimeInputtingCVE(false);
        }
    }
  return (
    <div>
      <h1>Welcome to the SingCert Alert Template Generator</h1>
      <div id="getting-started">
        <h2>Getting started</h2>
        <p>
            This tool has two different uses:
        </p>
        <ul>
            <li>Manual generation</li>
            <li style = {{marginLeft:"20px"}}>
                <p>
                    If the data on a CVE entry is not available in the database, you can manually enter the data and get a response from the LLM directly. Start by clicking the button above!
                </p>
            </li>
            <li>Automated generation</li>
            <li style = {{marginLeft:"20px"}}>
                <p>
                    If the data on a CVE entry is available in the database, you can retrieve a response from the LLM by entering the CVE-ID below and pressing "Send"
                </p>
            </li>
            
        </ul>
        <Container fixed = {true} disableGutters = {true} sx = {{justifySelf:"flex-start", margin:0, marginLeft:5}}>
            <TextField inputRef={inputRef} id = "outlined-basic" variant = "outlined" label = "Enter the CVE-ID" onChange= {(e) => handleChangeToCVEInput(e, setIsEntryForCVEIDInvalid, isFirstTimeInputtingCVE)} error = {isEntryForCVEIDInvalid} helperText= { isEntryForCVEIDInvalid ? "Invalid CVE-ID, please input in this format: 'CVE-????-...'" : ''}></TextField>
            <Button variant = "contained" sx = {{margin:1}} onClick = {handleOnClick} type = "submit"> Send </Button>
        </Container>
      </div>
    </div>
  );
}
