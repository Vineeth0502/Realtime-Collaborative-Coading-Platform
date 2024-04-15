import React, { useEffect, useRef, useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/htmlmixed/htmlmixed'; 
import CodeMirror from 'codemirror';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const outputRef = useRef(null);
    const [outputContent, setOutputContent] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

    useEffect(() => {
        const initEditor = () => {
            editorRef.current = CodeMirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: 'htmlmixed',
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
    }, []);

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

        try {
            const frame = document.createElement('iframe');
            frame.style.width = '100%';
            frame.style.height = '100%';
            frame.style.border = 'none';
            outputRef.current.innerHTML = '';
            outputRef.current.appendChild(frame);

            const frameDoc = frame.contentDocument || frame.contentWindow.document;
            frameDoc.open();
            frameDoc.write(codeToExecute);
            frameDoc.close();
            logExecution(codeToExecute);
        } catch (error) {
            setOutputContent(`Error: ${error.message}`);
        }
    };

    const logExecution = (code) => {
        const timestamp = new Date().toLocaleString();
        const logEntry = { timestamp, code };
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
                                    <button onClick={() => copyToClipboard(log.code)}>Copy</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <div>
                <button onClick={handleRunCode}>Run Code</button>
                <button onClick={toggleLogsModal}>Logs</button>
            </div>
            <textarea id="realtimeEditor"></textarea>
            <div ref={outputRef} style={{ backgroundColor: '#f0f0f0', color: '#333', padding: '10px', minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}></div>
        </div>
    );
};

export default Editor;
