import React, {useState, useRef, useEffect} from 'react';
import './styles.css'; 
import ReactDOM from 'react-dom';
import { SubmitHandler, useForm } from 'react-hook-form'; 
import { numberOfItems } from './feed';

export default function CreatePostPopup({show, onCloseButtonClick, onCreatePost, numberOfItems}) {

    const [isSubmit, setSubmit] = useState(false);
    const { register, handleSubmit } = useForm();

    const url = 'https://10.59.62.240:3001/send';
    const responseField = document.querySelector('#responseField');

    const [file, setFile] = useState(null); // The file that I uploaded locally
    const [uploadedChunks, setUploadedChunks] = useState([]); // The list of chunks that have been uploaded
    const [uploading, setUploading] = useState(false); // Whether the upload is in progress
    const uploadRequestRef = useRef(null); // A reference to the current upload request

    async function onSubmit (data) {
        const post = JSON.stringify({
            id: data.id,
            title: data.title,
            text: data.text,
            fileName: data.fileSrc[0].name,
        })
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: post,
                headers: {
                    'Content-type': 'application/json',
                }
            })

            if (response.ok) {
                const jsonResponse = await response.json();
            } else {
                console.error(response.statusText)
            }

        } catch (error) {
            console.log(error);
        }
        
        if (data.fileSrc[0]) {
            setFile(data.fileSrc[0])
        }
    
        const sendChunk = async (chunk) =>{

            try {
                const response = await fetch(`https://10.59.62.240:3001/file?name=${file.name}`, {
                    method: 'POST',
                    body: chunk,
                    headers: {
                        'Content-type': 'application/octet-stream'
                    }
                })

                if (response.ok) {
                    const jsonResponse = await response.json();
                } else {
                    console.error(response.statusText)
                }

            } catch (error) {
                console.log(error);
            }
        }


        if (!file) {
            alert("Please select a file to upload!");
            return;
        }

        const chunkSize = 1024; // 1MB
        const totalChunks = Math.ceil(file.size / chunkSize);

        let start = 0;
        let end = Math.min(chunkSize, file.size);

        setUploading(true);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(start, end);
            const uploadedChunkIndex = uploadedChunks.indexOf(i);

            if (uploadedChunkIndex === -1) {
                try {
                    const response = await sendChunk(chunk);
                    setUploadedChunks((prevChunks) => [...prevChunks, i]);

                    // Save the list of uploaded chunks to local storage
                    localStorage.setItem("uploadedChunks", JSON.stringify(uploadedChunks));
                } catch (error) {
                    console.error(error); // Handle the error
                }
            }

        start = end;
        end = Math.min(start + chunkSize, file.size);
        

        setUploading(false);

        // Upload is complete, clear the list of uploaded chunks from local storage
        localStorage.removeItem("uploadedChunks");
        };

        setSubmit(true);
    }

    useEffect(() => {
        const storedUploadedChunks = localStorage.getItem("uploadedChunks");

        if (storedUploadedChunks) {
            setUploadedChunks(JSON.parse(storedUploadedChunks));
        }
    }, []);

    function handleClose() {
        onCloseButtonClick();
        setSubmit(false);
    }

    if (!show) {
        return null;
    } else {
        if (!isSubmit) {
            return ReactDOM.createPortal(
                <div className="modal-wrapper">
                    <div className="modal">
                        <div className="body">
                            <h2>Popup Form</h2> 
                            <form className="form-container" onSubmit={handleSubmit(onSubmit)}> 
                                <label className="form-label" for="id"> 
                                    Post id: 
                                </label> 
                                <input {...register('id')} className="form-input" type="text" 
                                    placeholder="Enter Post ID" 
                                    id="id" required /> 
                                <label className="form-label" for="title">
                                    Title:
                                </label> 
                                <input {...register('title')} 
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter Your Title"
                                    id="title" 
                                    required /> 
                                <label className="form-label" for="text">
                                    Text:
                                </label> 
                                <input {...register('text')}  
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter Your Text"
                                    id="text" 
                                    required /> 
                                <label className="form-label" for="imageSrc">
                                    Image/Video:
                                </label> 
                                <input {...register('fileSrc')}  
                                    className="form-input"
                                    input type="file" 
                                    id="fileSrc" 
                                    required /> 
                                <button className="button" type="submit"> 
                                    Submit 
                                </button> 
                            </form> 
                        </div>
                        <div className="footer">
                            <button onClick={handleClose}>Close Modal</button>
                        </div>
                    </div>
                </div>
                , document.body
            );
        } else {
            return (
                <div className="modal-wrapper">
                    <div className="modal">
                        <div className="body">
                            <h2>Your post was created</h2> 
                        </div>
                        <div className="footer">
                            <button onClick={handleClose}>Close Modal</button>
                        </div>
                    </div>
                </div>
            )
        }
    }

}