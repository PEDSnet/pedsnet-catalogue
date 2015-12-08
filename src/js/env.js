var urls = window.catalogue.services;

var root = window.catalogue.root;
// trim off the training slash
if (root.substring(root.length-1) === '/') {
    root = root.substring(0, root.length-1);
}

module.exports = {
    serviceURLs: urls,
    root: root,
};
