function showConfirm(message) {
    return new Promise((resolve) => {
        // Create the overlay element
        var overlay = document.createElement("div");
        overlay.className = "confirmOverlay";

        // Create the message element
        var messageElement = document.createElement("p");
        messageElement.className = "confirmMessage";
        var messageContent = document.createTextNode(message);
        messageElement.appendChild(messageContent);

        // Create the options element
        var optionsElement = document.createElement("div");
        optionsElement.className = "options mt-1";

        // Create the cancel button
        var cancelButton = document.createElement("a");
        cancelButton.onclick = function () {
            // Handle cancel action here
            document.body.removeChild(overlay);
            resolve(false);
        };
        cancelButton.className = "confirmBtn";
        cancelButton.textContent = "cancel";

        // Create the OK button
        var okButton = document.createElement("a");
        okButton.onclick = function () {
            // Handle OK action here
            document.body.removeChild(overlay);
            resolve(true);
        };
        okButton.className = "confirmBtn";
        okButton.textContent = "ok";

        // Append elements to the overlay
        overlay.appendChild(messageElement);
        optionsElement.appendChild(cancelButton);
        optionsElement.appendChild(okButton);
        overlay.appendChild(optionsElement);

        // Append the overlay to the body
        document.body.appendChild(overlay);
    });
}