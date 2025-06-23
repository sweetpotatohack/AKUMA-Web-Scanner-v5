import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [showScanForm, setShowScanForm] = useState(false);
  const [scanName, setScanName] = useState('');
  const [targets, setTargets] = useState('');
  const [isCreatingScan, setIsCreatingScan] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showVulnDetails, setShowVulnDetails] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanType, setScanType] = useState('ultimate');
  const [dashboardStats, setDashboardStats] = useState({});
  const [vulnGroupBy, setVulnGroupBy] = useState('severity');
  const [selectedTool, setSelectedTool] = useState('all');

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get('/api/health');
      setMessage('🔥 AKUMA Scanner v3.0 Ultimate Ready! 💀');
      
      const [scansResponse, statsResponse] = await Promise.all([
        axios.get('/api/scans'),
        axios.get('/api/dashboard/stats')
      ]);
      
      setScans(scansResponse.data || []);
      setDashboardStats(statsResponse.data || {});
    } catch (error) {
      setMessage('⚠️ Backend Connection Failed');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewScan = async () => {
    setShowScanForm(true);
  };

  const createScan = async () => {
    if (!scanName.trim() || (!targets.trim() && !selectedFile)) {
      setMessage('❌ Please fill scan name and targets or upload file');
      return;
    }

    setIsCreatingScan(true);
    try {
      let response;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('name', scanName);
        formData.append('scan_type', scanType);
        formData.append('file', selectedFile);
        
        response = await axios.post('/api/scans/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const targetList = targets.split('\n').map(t => t.trim()).filter(t => t);
        
        response = await axios.post('/api/scans', {
          name: scanName,
          targets: targetList,
          scan_type: scanType,
          scan_options: {
            enable_testssl: true,
            enable_wayback: true,
            enable_subdomain_enum: true,
            enable_api_testing: true,
            enable_cms_deep_scan: true
          }
        });
      }
      
      setMessage(`✅ Ultimate Scan "${scanName}" Started! ID: ${response.data.id}`);
      setScanName('');
      setTargets('');
      setSelectedFile(null);
      setShowScanForm(false);
      
      loadData();
    } catch (error) {
      setMessage('❌ Failed to start scan: ' + (error.response?.data?.detail || 'Unknown error'));
      console.error('Scan Error:', error);
    } finally {
      setIsCreatingScan(false);
    }
  };

  const viewVulnerabilities = async (scan) => {
    try {
      const response = await axios.get(`/api/scans/${scan.id}/vulnerabilities`);
      setVulnerabilities(response.data.vulnerabilities || []);
      setSelectedScan(scan);
      setShowVulnDetails(true);
    } catch (error) {
      setMessage('❌ Failed to load vulnerabilities');
      console.error('Vuln Error:', error);
    }
  };

  const downloadReport = async (scanId) => {
    try {
      const response = await axios.get(`/api/scans/${scanId}/report?format=html`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AKUMA_Report_${scanId}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage(`📄 Report downloaded for scan ${scanId}`);
    } catch (error) {
      setMessage('❌ Failed to download report');
      console.error('Report Error:', error);
    }
  };

  const openGrafana = async () => {
    try {
      const response = await axios.get('/api/grafana/url');
      window.open(response.data.grafana_url, '_blank');
    } catch (error) {
      window.open('http://localhost:3000', '_blank');
    }
  };

  const deleteScan = async (scanId) => {
    try {
      await axios.delete(`/api/scans/${scanId}`);
      setMessage(`🗑️ Scan ${scanId} deleted`);
      loadData();
    } catch (error) {
      setMessage('❌ Failed to delete scan');
      console.error('Delete Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffff00';
      case 'running': return '#00ddff';
      case 'completed': return '#00ff00';
      case 'failed': return '#ff0066';
      default: return '#666';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ff0066';
      case 'High': return '#ff6600';
      case 'Medium': return '#ffff00';
      case 'Low': return '#00ff66';
      case 'Info': return '#00ddff';
      default: return '#666';
    }
  };

  const getToolColor = (tool) => {
    const colors = {
      'testssl.sh': '#ff6600',
      'wayback': '#8338ec',
      'subfinder': '#00ddff',
      'api_scanner': '#ff006e',
      'cms_detector': '#00ff66',
      'nmap': '#ffff00',
      'nuclei': '#ff0066'
    };
    return colors[tool] || '#666';
  };

  const getProgressBar = (progress) => {
    return (
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '10px', 
        overflow: 'hidden',
        height: '20px',
        margin: '5px 0'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(45deg, #00ff00, #00ddff)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  const filterVulnerabilities = (vulns) => {
    if (selectedTool === 'all') return vulns;
    return vulns.filter(v => v.tool === selectedTool);
  };

  const groupVulnerabilities = (vulns) => {
    const filtered = filterVulnerabilities(vulns);
    
    if (vulnGroupBy === 'severity') {
      const groups = {};
      filtered.forEach(v => {
        const severity = v.severity || 'Unknown';
        if (!groups[severity]) groups[severity] = [];
        groups[severity].push(v);
      });
      return groups;
    } else if (vulnGroupBy === 'tool') {
      const groups = {};
      filtered.forEach(v => {
        const tool = v.tool || 'unknown';
        if (!groups[tool]) groups[tool] = [];
        groups[tool].push(v);
      });
      return groups;
    } else {
      return { 'All': filtered };
    }
  };

  if (loading) {
    return (
      <div className="cyberpunk-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px' 
      }}>
        <div className="neon-text glitch">
          🔄 INITIALIZING AKUMA ULTIMATE v3.0... 🔄
        </div>
      </div>
    );
  }

  if (showVulnDetails && selectedScan) {
    const groupedVulns = groupVulnerabilities(vulnerabilities);
    const allTools = [...new Set(vulnerabilities.map(v => v.tool || 'unknown'))];

    return (
      <div className="cyberpunk-container">
        <div style={{ padding: '20px' }}>
          <button 
            onClick={() => setShowVulnDetails(false)}
            style={{
              background: 'transparent',
              border: '1px solid #00ff00',
              color: '#00ff00',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Scans
          </button>
          
          <h1 className="neon-text" style={{ 
            fontSize: '36px', 
            marginBottom: '20px',
            color: '#00ddff' 
          }}>
            🔍 Ultimate Vulnerability Analysis - {selectedScan.name}
          </h1>

          {/* Enhanced Controls */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #666',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ color: '#00ff00', marginRight: '10px' }}>Group by:</label>
              <select
                value={vulnGroupBy}
                onChange={(e) => setVulnGroupBy(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  padding: '5px 10px',
                  borderRadius: '3px'
                }}
              >
                <option value="severity">Severity</option>
                <option value="tool">Tool</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div>
              <label style={{ color: '#00ff00', marginRight: '10px' }}>Filter by tool:</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  padding: '5px 10px',
                  borderRadius: '3px'
                }}
              >
                <option value="all">All Tools</option>
                {allTools.map(tool => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => downloadReport(selectedScan.id)}
              style={{
                background: 'linear-gradient(45deg, #8338ec, #ff006e)',
                border: 'none',
                color: '#fff',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📄 Download Report
            </button>
          </div>

          {/* Summary Dashboard */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '2px solid #00ff00',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ff0066', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Critical').length}
                </div>
                <div style={{ color: '#666' }}>Critical</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ff6600', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'High').length}
                </div>
                <div style={{ color: '#666' }}>High</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ffff00', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Medium').length}
                </div>
                <div style={{ color: '#666' }}>Medium</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#00ff66', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Low').length}
                </div>
                <div style={{ color: '#666' }}>Low</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#00ddff', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Info').length}
                </div>
                <div style={{ color: '#666' }}>Info</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#8338ec', fontSize: '24px', fontWeight: 'bold' }}>
                  {allTools.length}
                </div>
                <div style={{ color: '#666' }}>Tools Used</div>
              </div>
            </div>
          </div>

          {/* Vulnerabilities by Group */}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {Object.entries(groupedVulns).map(([groupName, groupVulns]) => (
              <div key={groupName} style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  color: vulnGroupBy === 'severity' ? getSeverityColor(groupName) : 
                         vulnGroupBy === 'tool' ? getToolColor(groupName) : '#00ddff',
                  borderBottom: '2px solid currentColor',
                  paddingBottom: '10px',
                  marginBottom: '15px'
                }}>
                  {groupName} ({groupVulns.length})
                </h3>
                
                {groupVulns.map((vuln, index) => (
                  <div key={index} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${getSeverityColor(vuln.severity)}`,
                    padding: '20px',
                    margin: '15px 0',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ color: '#00ddff', margin: 0 }}>{vuln.type}</h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ 
                          color: getSeverityColor(vuln.severity),
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {vuln.severity}
                        </span>
                        <span style={{ 
                          color: getToolColor(vuln.tool),
                          fontSize: '12px',
                          background: 'rgba(0,0,0,0.5)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {vuln.tool}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#00ff00', margin: '5px 0' }}>
                        <strong>Target:</strong> {vuln.target}
                      </p>
                      {vuln.port && (
                        <p style={{ color: '#00ff00', margin: '5px 0' }}>
                          <strong>Port/Service:</strong> {vuln.port}/{vuln.service}
                        </p>
                      )}
                      {vuln.cvss_score && (
                        <p style={{ color: '#ffff00', margin: '5px 0' }}>
                          <strong>CVSS Score:</strong> {vuln.cvss_score}
                        </p>
                      )}
                      {/* Tool-specific fields */}
                      {vuln.cipher && (
                        <p style={{ color: '#ff6600', margin: '5px 0' }}>
                          <strong>Cipher:</strong> {vuln.cipher}
                        </p>
                      )}
                      {vuln.tls_version && (
                        <p style={{ color: '#ff6600', margin: '5px 0' }}>
                          <strong>TLS Version:</strong> {vuln.tls_version}
                        </p>
                      )}
                      {vuln.subdomain && (
                        <p style={{ color: '#8338ec', margin: '5px 0' }}>
                          <strong>Subdomain:</strong> {vuln.subdomain}
                        </p>
                      )}
                      {vuln.endpoint && (
                        <p style={{ color: '#ff006e', margin: '5px 0' }}>
                          <strong>API Endpoint:</strong> {vuln.endpoint}
                        </p>
                      )}
                      {vuln.snapshot_date && (
                        <p style={{ color: '#8338ec', margin: '5px 0' }}>
                          <strong>Wayback Date:</strong> {vuln.snapshot_date}
                        </p>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: '#ffffff', lineHeight: '1.6' }}>
                        <strong>Description:</strong><br />
                        {vuln.description}
                      </p>
                    </div>

                    {vuln.impact && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#ff6600', lineHeight: '1.6' }}>
                          <strong>Impact:</strong><br />
                          {vuln.impact}
                        </p>
                      </div>
                    )}

                    {vuln.solution && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#00ff66', lineHeight: '1.6' }}>
                          <strong>Solution:</strong><br />
                          {vuln.solution}
                        </p>
                      </div>
                    )}

                    {vuln.payload && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                          <strong>Payload:</strong><br />
                          <code style={{ 
                            background: 'rgba(0,0,0,0.5)', 
                            padding: '5px', 
                            borderRadius: '3px',
                            display: 'block',
                            marginTop: '5px'
                          }}>
                            {vuln.payload}
                          </code>
                        </p>
                      </div>
                    )}

                    {vuln.references && vuln.references.length > 0 && (
                      <div style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#00ddff', fontSize: '14px' }}>
                          <strong>References:</strong><br />
                          {vuln.references.map((ref, idx) => (
                            <a key={idx} href={ref} target="_blank" rel="noopener noreferrer" 
                               style={{ color: '#00ddff', display: 'block', marginTop: '3px' }}>
                              {ref}
                            </a>
                          ))}
                        </p>
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                      Detected: {new Date(vuln.detected_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyberpunk-container">
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 className="neon-text glitch" style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #ff006e, #00ff00, #8338ec)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔥 AKUMA ULTIMATE v3.0 💀
        </h1>
        
        <h2 className="neon-text" style={{ 
          fontSize: '24px', 
          marginBottom: '30px',
          color: '#00ddff' 
        }}>
          The Ultimate Security Arsenal - TestSSL • Wayback • API Testing
        </h2>

        {/* Enhanced Dashboard Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '15px',
          marginBottom: '30px',
          maxWidth: '1200px',
          margin: '0 auto 30px auto'
        }}>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #00ff00',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#00ddff', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_scans || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Scans</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ff6600',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ff6600', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_vulnerabilities || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Vulnerabilities</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ffff00',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ffff00', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_targets || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Targets</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ff0066',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ff0066', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.critical_vulnerabilities || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Critical</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #8338ec',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#8338ec', fontSize: '24px', fontWeight: 'bold' }}>
              {Object.keys(dashboardStats.tools_stats || {}).length}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Tools Active</div>
          </div>
        </div>

        {/* Tools Stats */}
        {dashboardStats.tools_stats && Object.keys(dashboardStats.tools_stats).length > 0 && (
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.5)', 
            border: '1px solid #666',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '30px',
            maxWidth: '1200px',
            margin: '0 auto 30px auto'
          }}>
            <h4 style={{ color: '#00ddff', marginBottom: '15px' }}>🔧 Active Security Tools</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.entries(dashboardStats.tools_stats).map(([tool, count]) => (
                <span key={tool} style={{
                  background: getToolColor(tool),
                  color: '#000',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {tool}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.7)', 
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '30px',
          margin: '20px auto',
          maxWidth: '1200px',
          boxShadow: '0 0 30px rgba(0, 255, 0, 0.3)'
        }}>
          <p className="neon-text" style={{ fontSize: '20px', marginBottom: '20px' }}>
            {message}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <button 
              className="cyber-button" 
              onClick={startNewScan}
              style={{ 
                fontSize: '18px',
                padding: '15px 30px',
                margin: '10px'
              }}
            >
              🚀 START ULTIMATE SCAN 🚀
            </button>
            
            <button 
              className="cyber-button" 
              onClick={openGrafana}
              style={{ 
                fontSize: '18px',
                padding: '15px 30px',
                margin: '10px',
                background: 'linear-gradient(45deg, #8338ec, #ff006e)'
              }}
            >
              📊 OPEN GRAFANA 📊
            </button>
          </div>

          {showScanForm && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #00ddff',
              borderRadius: '10px',
              padding: '20px',
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#00ddff', marginBottom: '15px' }}>
                🎯 Create Ultimate Security Scan
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Scan Name:
                </label>
                <input
                  type="text"
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  placeholder="Enter scan name..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Scan Type:
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="ultimate">🔥 Ultimate Scan (All Tools)</option>
                  <option value="ssl">🔒 SSL/TLS Focus (TestSSL)</option>
                  <option value="recon">🔍 Reconnaissance (Subdomain + Wayback)</option>
                  <option value="api">⚡ API Security Testing</option>
                  <option value="cms">🎨 CMS Deep Scan</option>
                  <option value="wordpress">📝 WordPress Focused</option>
                  <option value="bitrix">🏢 Bitrix CMS Focused</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Upload Targets File (optional):
                </label>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                />
                {selectedFile && (
                  <div style={{ color: '#00ddff', fontSize: '14px', marginTop: '5px' }}>
                    ✅ File selected: {selectedFile.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Manual Targets (one per line):
                </label>
                <textarea
                  value={targets}
                  onChange={(e) => setTargets(e.target.value)}
                  placeholder="example.com
google.com
https://portal.keydisk.ru/
api.example.com"
                  rows={5}
                  disabled={!!selectedFile}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: selectedFile ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: selectedFile ? '#666' : '#00ff00',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <button 
                  className="cyber-button" 
                  onClick={createScan}
                  disabled={isCreatingScan}
                  style={{ 
                    fontSize: '16px',
                    padding: '10px 20px',
                    margin: '5px',
                    opacity: isCreatingScan ? 0.6 : 1
                  }}
                >
                  {isCreatingScan ? '⏳ Launching...' : '💥 LAUNCH ULTIMATE SCAN 💥'}
                </button>
                
                <button 
                  onClick={() => {
                    setShowScanForm(false);
                    setSelectedFile(null);
                    setTargets('');
                    setScanName('');
                  }}
                  style={{ 
                    fontSize: '16px',
                    padding: '10px 20px',
                    margin: '5px',
                    background: 'transparent',
                    border: '1px solid #666',
                    color: '#666',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 className="neon-text" style={{ color: '#ff6600', marginBottom: '15px' }}>
              📊 Recent Ultimate Scans: {scans.length}
            </h3>
            
            {scans.length > 0 ? (
              <div style={{ textAlign: 'left' }}>
                {scans.slice(-10).reverse().map((scan, index) => (
                  <div key={scan.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #00ff00',
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#00ddff', fontWeight: 'bold' }}>
                          {scan.name} (#{scan.id})
                        </span>
                        <br />
                        <span style={{ color: '#ffff00', fontSize: '14px' }}>
                          Targets: {scan.targets.slice(0, 3).join(', ')}
                          {scan.targets.length > 3 && ` +${scan.targets.length - 3} more`}
                        </span>
                        <br />
                        <span style={{ color: '#8338ec', fontSize: '12px' }}>
                          Type: {scan.scan_type || 'ultimate'}
                        </span>
                        {scan.tools_used && scan.tools_used.length > 0 && (
                          <>
                            <br />
                            <span style={{ color: '#666', fontSize: '12px' }}>
                              Tools: {scan.tools_used.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          color: getStatusColor(scan.status),
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {scan.status}
                        </span>
                        <br />
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {scan.progress}%
                        </span>
                      </div>
                    </div>
                    
                    {scan.progress > 0 && getProgressBar(scan.progress)}
                    
                    {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ color: '#ff6600' }}>
                          🚨 Vulnerabilities found: {scan.vulnerabilities.length}
                        </span>
                        <div style={{ marginTop: '5px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#ff0066', fontSize: '12px' }}>
                            Critical: {scan.vulnerabilities.filter(v => v.severity === 'Critical').length}
                          </span>
                          <span style={{ color: '#ff6600', fontSize: '12px' }}>
                            High: {scan.vulnerabilities.filter(v => v.severity === 'High').length}
                          </span>
                          <span style={{ color: '#ffff00', fontSize: '12px' }}>
                            Medium: {scan.vulnerabilities.filter(v => v.severity === 'Medium').length}
                          </span>
                          <span style={{ color: '#00ff66', fontSize: '12px' }}>
                            Low: {scan.vulnerabilities.filter(v => v.severity === 'Low').length}
                          </span>
                        </div>
                        
                        {/* Tool breakdown */}
                        {scan.summary && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {scan.summary.testssl_vulns > 0 && (
                              <span style={{ color: '#ff6600', fontSize: '11px' }}>
                                🔒 TestSSL: {scan.summary.testssl_vulns}
                              </span>
                            )}
                            {scan.summary.wayback_findings > 0 && (
                              <span style={{ color: '#8338ec', fontSize: '11px' }}>
                                ⏰ Wayback: {scan.summary.wayback_findings}
                              </span>
                            )}
                            {scan.summary.api_issues > 0 && (
                              <span style={{ color: '#ff006e', fontSize: '11px' }}>
                                ⚡ API: {scan.summary.api_issues}
                              </span>
                            )}
                            {scan.summary.subdomains_found > 0 && (
                              <span style={{ color: '#00ddff', fontSize: '11px' }}>
                                🔍 Subdomains: {scan.summary.subdomains_found}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: '10px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      {scan.status === 'completed' && scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                        <>
                          <button 
                            onClick={() => viewVulnerabilities(scan)}
                            style={{
                              background: 'linear-gradient(45deg, #00ddff, #00ff00)',
                              border: 'none',
                              color: '#000',
                              padding: '5px 10px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            🔍 View Details
                          </button>
                          
                          <button 
                            onClick={() => downloadReport(scan.id)}
                            style={{
                              background: 'linear-gradient(45deg, #8338ec, #ff006e)',
                              border: 'none',
                              color: '#fff',
                              padding: '5px 10px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            📄 Report
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => deleteScan(scan.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ff006e',
                          color: '#ff006e',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No scans yet. Launch your first ultimate cyberpunk hack! 🔥
              </p>
            )}
          </div>

          <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            <p>🔥 Powered by AKUMA & Феня - The Ultimate Cyber Gods v3.0 💀</p>
            <p>Arsenal: TestSSL • Wayback • Subdomain Enum • API Testing • CMS Deep Scan • Report Generation</p>
            <p>Status: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
