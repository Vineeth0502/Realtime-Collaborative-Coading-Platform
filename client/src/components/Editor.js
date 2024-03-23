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
        } catch (error) {
            setOutputContent(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <div>
                <button 
                    onClick={handleRunCode} 
                    style={{ 
                        backgroundColor: '#4CAF50', 
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Run Code
                </button>
            </div>
            <textarea 
                id="realtimeEditor" 
                style={{ 
                    width: '100%', 
                    minHeight: '200px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: '10px',
                    boxSizing: 'border-box',
                    marginTop: '10px',
                }}
            ></textarea>
            <div 
                ref={outputRef} 
                style={{ 
                    backgroundColor: '#f0f0f0', 
                    color: '#333', 
                    padding: '10px', 
                    minHeight: '100px', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    borderRadius: '4px',
                    marginTop: '10px',
                }}
            ></div>
        </div>
    );
};

export default Editor;
