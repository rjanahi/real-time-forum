// Function to show a section and hide others
function showSection(sectionToShow, urlSuffix) {
    errorSection.hidden = true;
    mainSection.hidden = true;
    signUpSection.hidden = true;
    logInSection.hidden = true;
    postPageSection.hidden = true;
    createPostSection.hidden = true;
    aboutUsSection.hidden = true;
    commentsSection.hidden = true;
    sectionToShow.hidden = false;

    // Update the URL
    history.pushState(null, '', urlSuffix);
}