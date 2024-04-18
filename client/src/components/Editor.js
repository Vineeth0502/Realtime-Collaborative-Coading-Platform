import React, { useEffect, useRef, useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/htmlmixed/htmlmixed'; 
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import CodeMirror from 'codemirror';
import { Octokit } from '@octokit/rest'; // Import Octokit from @octokit/rest
import ACTIONS from '../Actions';
import { Buffer } from 'buffer';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const outputRef = useRef(null);
    const [outputContent, setOutputContent] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [language, setLanguage] = useState('javascript');
    

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.toTextArea();
            editorRef.current = null;
        }
        const initEditor = () => {
            editorRef.current = CodeMirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: {
                        name: getMode(language),
                        json: true
                    },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue' && socketRef.current) {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        };
        initEditor();
    }, [language]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    useEffect(() => {
        const savedLogs = localStorage.getItem('editorLogs');
        if (savedLogs) {
            setLogs(JSON.parse(savedLogs));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('editorLogs', JSON.stringify(logs));
    }, [logs]);

    const handleRunCode = () => {
        const codeToExecute = editorRef.current.getValue();
        let output;

        try {
            switch (language) {
                case 'javascript':
                    output = executeJavaScript(codeToExecute);
                    break;
                case 'c':
                    output = executeC(codeToExecute);
                    break;
                case 'java':
                    output = executeJava(codeToExecute);
                    break;
                case 'python':
                    output = executePython(codeToExecute);
                    break;
                default:
                    output = 'Unsupported language';
            }
        } catch (error) {
            output = `Error: ${error.message}`;
        }

        setOutputContent(output);
        logExecution(codeToExecute, output);
    };

    const logExecution = (code, output) => {
        const timestamp = new Date().toLocaleString();
        const logEntry = { timestamp, code, output };
        setLogs((prevLogs) => [...prevLogs, logEntry]);
    };

    const clearLogs = () => {
        setLogs([]);
        localStorage.removeItem('editorLogs');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert('Copied to clipboard'))
            .catch((error) => console.error('Error copying to clipboard: ', error));
    };

    const toggleLogsModal = () => {
        setIsLogsModalOpen((prev) => !prev);
    };

    const getMode = (language) => {
        switch (language) {
            case 'javascript':
                return 'javascript';
            case 'c':
                return 'text/x-csrc';
            case 'java':
                return 'text/x-java';
            case 'python':
                return 'python';
            default:
                return 'javascript';
        }
    };

    const executeJavaScript = (code) => {
        try {
            // Create a new iframe element
            const frame = document.createElement('iframe');
            frame.style.width = '100%';
            frame.style.height = '100%';
            frame.style.border = 'none';
    
            // Append the iframe to the outputRef element
            outputRef.current.innerHTML = '';
            outputRef.current.appendChild(frame);
    
            // Get the document object of the iframe
            const frameDoc = frame.contentDocument || frame.contentWindow.document;
    
            // Write the code into the iframe document
            frameDoc.open();
            frameDoc.write(code);
            frameDoc.close();
    
            // Set the output content
            setOutputContent('Code executed successfully');
    
        } catch (error) {
            // Set the error message as output content
            setOutputContent(`Error executing code: ${error.message}`);
        }
    };

    const executeC = (code) => {
        try {
            // Simulate compilation and execution of C code
            const compiledOutput = `Compiled and executed C code:\n${code}`;
            setOutputContent(compiledOutput);
        } catch (error) {
            setOutputContent(`Error executing C code: ${error.message}`);
        }
    };
    
    const executeJava = (code) => {
        try {
            // Simulate compilation and execution of Java code
            const compiledOutput = `Compiled and executed Java code:\n${code}`;
            setOutputContent(compiledOutput);
        } catch (error) {
            setOutputContent(`Error executing Java code: ${error.message}`);
        }
    };
    
    const executePython = (code) => {
        try {
            // Simulate execution of Python code
            const executedOutput = `Executed Python code:\n${code}`;
            setOutputContent(executedOutput);
        } catch (error) {
            setOutputContent(`Error executing Python code: ${error.message}`);
        }
    };

    const handlePushToGitHub = async () => {
        const accessToken = prompt('Please enter your GitHub access token:'); // Prompt for access token
        if (!accessToken) return;
    
        try {
            const octokit = new Octokit({ auth: accessToken }); 
    
            const repoName = prompt('Please enter the repository name (username/repo):');
            if (!repoName) return;
    
            const filePath = prompt('Please enter the file path (e.g., path/to/file.txt):');
            if (!filePath) return;
    
            const codeToPush = editorRef.current.getValue();
    
            const response = await octokit.repos.createOrUpdateFileContents({
                owner: repoName.split('/')[0],
                repo: repoName.split('/')[1],
                path: filePath,
                message: 'Pushing code from the application',
                content: Buffer.from(codeToPush).toString('base64'),
            });
    
            console.log('Code pushed successfully:', response.data);
            alert('Code pushed successfully to GitHub!');
        } catch (error) {
            console.error('Error pushing code to GitHub:', error);
            alert(`Error pushing code to GitHub: ${error.message}`);
        }
    };
    

    return (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', color: '#333', height: '100%', overflowY: 'auto' }}>
            {isLogsModalOpen && (
                <div className="logs-modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', zIndex: '1000' }}>
                    <div className="logs-modal-content" style={{ backgroundColor: '#f0f0f0', color: '#333', overflowY: 'auto', maxHeight: '80vh' }}>
                        <span className="logs-modal-close" style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={toggleLogsModal}>&times;</span>
                        <h3>Logs:</h3>
                        <button onClick={clearLogs}>Clear Logs</button>
                        <ul>
                            {logs.map((log, index) => (
                                <li key={index}>
                                    <div>{log.timestamp}</div>
                                    <pre>{log.code}</pre>
                                    <pre>{log.output}</pre>
                                    <button onClick={() => copyToClipboard(log.code)}>Copy Code</button>
                                    <button onClick={() => copyToClipboard(log.output)}>Copy Output</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <div>
                <button onClick={handleRunCode}>Run Code</button>
                <button onClick={toggleLogsModal}>Logs</button>
                <button onClick={handlePushToGitHub}>Push to GitHub</button>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                </select>
            </div>
            <textarea id="realtimeEditor"></textarea>
            <div ref={outputRef} style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '10px', minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>{outputContent}</div>
        </div>
    );
};

export default Editor;
