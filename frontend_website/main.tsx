import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ResultsPage from './ResultsPage'
import FormPage from './FormPage'
import Layout from './_layout'
import FrontPage from './FrontPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FrontPage/>} />
          <Route path="/CVE/:cve_id"  element={<ResultsPage/>} />
          <Route path="/manual_entry" element={<FormPage/>}/>
        </Routes>
      </Layout>
    </Router>
)
