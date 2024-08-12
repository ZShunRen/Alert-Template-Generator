import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
const pages = [
  {
    name:"manual generation",
    path:"/manual_entry"
  },
];

function ResponsiveAppBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();  
  return (
    <AppBar position="static" sx= {{
      backgroundColor: '#f5f5f5',
      shadows: 0,
      marginBottom: 2
   }}>
      <Container maxWidth="xl" sx={{margin:0, padding: 0, width:"100%"}}>
        <Toolbar disableGutters >
          <Box
              sx={{
                padding:"0",
                width: "10%",
                display:'flex',
                justifyContent: 'flex-start',
              }}
            >
            <Box>
              <Button startIcon={<img src={'/singcert-logo.svg'}  style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto', width: 'auto'}}/>} sx = {{margin:0, padding:0}} onClick = {() => navigate("/")}>
              </Button>
            </Box>
        </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', marginLeft:"5%", alignItems:"start"} }}>
            {pages.map((page) => {
              if (currentPath === page.path) {
                return (
                  <Button
                key={page.name}
                variant = "contained"
                color={'primary'}
                sx={{ my: 2, display: 'block' }}
                href={page.path}
              >
                {page.name}
              </Button>
                )
              } else {
                return (
                  <Button
                  key={page.name}
                  variant = "outlined"
                  color={'primary'}
                  sx={{ my: 2, display: 'block' }}
                  href={page.path}
                >
                  {page.name}
                </Button>
                )
              }
              })
            }
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;