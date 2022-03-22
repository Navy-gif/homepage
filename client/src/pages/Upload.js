import React, { useState } from "react";
import '../css/Upload.css';

const Upload = () => {

    const [selectedFile, updateSelection] = useState(null);
    const [clipname, updateName] = useState('');

    const submit = async ({target: button}) => {

        button.disabled = true;
        const formData = new FormData();
        formData.set('file', selectedFile, selectedFile.name);
        formData.set('name', clipname);
        //console.log(selectedFile)

        // for(const value of formData.values()) console.log('loop',value);
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        button.disabled = false;
        updateSelection(null);
        updateName('');
        console.log(response);

    };

    return (
        <div className="panel">

            <div className="uploadform">

                <table >
                    <tbody>
                        <tr>
                            <td>
                                <label htmlFor='file'>Choose clip to upload</label>
                            </td>
                            <td>
                                <input
                                    id='file'
                                    type='file'
                                    name='clip'
                                    accept='.mp4'
                                    onChange={event => updateSelection(event.target.files[0])}
                                />
                            </td>
                        </tr>
                        {selectedFile ?
                            <tr>
                                <td>
                                    <label htmlFor='name'>Name the clip</label>
                                </td>
                                <td>
                                    <input
                                        id='name'
                                        type='text'
                                        onChange={event => updateName(event.target.value)}
                                        autoComplete='off'
                                    />
                                </td>
                            </tr>
                            : <tr></tr>}
                    </tbody>
                </table>

                {selectedFile && clipname.length ?
                    <button onClick={submit}>
                        SUBMIT
                    </button>
                    : ''}

            </div>
            
        </div>
    );

};

export default Upload;