// Script run within the webview itself.
(function () {

    // Get a reference to the VS Code webview api.
    // We use this API to post messages back to our extension.

    // @ts-ignore
    const vscode = acquireVsCodeApi();


    const notesContainer = /** @type {HTMLElement} */ (document.querySelector('.notes'));

    const addButtonContainer = document.querySelector('.add-button');
    addButtonContainer.querySelector('button').addEventListener('click', () => {
        vscode.postMessage({
            type: 'add'
        });
    })

    const errorContainer = document.createElement('div');
    document.body.appendChild(errorContainer);
    errorContainer.className = 'error'
    errorContainer.style.display = 'none'

    /**
     * Render the document in the webview.
     */
    function updateContent(/** @type {string} */ text) {
        let json;
        try {
            if (!text) {
                text = '{}';
            }
            json = JSON.parse(text);

            notesContainer.style.display = '';
            errorContainer.style.display = 'none';

            // Render the scratches
            notesContainer.innerHTML = '';
            let results = json.searchResults.results || [];
            for (var i = 0; i < results.length; i++) {
                const element = document.createElement('div');
                element.className = 'note';
                notesContainer.appendChild(element);

                const text = document.createElement('div');
                text.className = 'text';
                const textContent = document.createElement('span');
                textContent.innerText = results[i].snippet_code;
                text.appendChild(textContent);
                element.appendChild(text);

                const button = document.createElement('button');
                button.innerText = 'Copy';
                const finalId = i;
                button.addEventListener('click', () => {
                    vscode.postMessage({
                        type: 'insert', id: finalId
                    });
                });
                element.appendChild(button);

                // created.innerText = new Date(note.created).toUTCString();
                // element.appendChild(created);

                // const deleteButton = document.createElement('button');
                // deleteButton.className = 'delete-button';
                // deleteButton.addEventListener('click', () => {
                // 	vscode.postMessage({ type: 'delete', id: note.id, });
                // });
                // element.appendChild(deleteButton);
            }

            notesContainer.appendChild(addButtonContainer);
        } catch (e){
            notesContainer.style.display = 'none';
            notesContainer.innerText = 'ERROR:((((((';
            errorContainer.innerText = `Error: Document is not valid json: ${e}`;
            errorContainer.style.display = '';
            return;
        }
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update':
                const text = message.text;

                // Update our webview's content
                updateContent(text);

                // Then persist state information.
                // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
                vscode.setState({ text });

                return;
        }
    });

    // Webviews are normally torn down when not visible and re-created when they become visible again.
    // State lets us save information across these re-loads
    const state = vscode.getState();
    if (state) {
        updateContent(state.text);
    }
}());