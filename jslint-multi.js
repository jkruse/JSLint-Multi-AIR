/**
 * @author Jakob Kruse
 */

var feedback, list, basepath;

function init() {
    feedback = document.getElementById('feedback');
    feedback.addEventListener('dragenter', onDragEnter);
    feedback.addEventListener('dragover', onDragOver);
    feedback.addEventListener('dragleave', onDragLeave);
    feedback.addEventListener('drop', onDrop);
    feedback.orgBackground = feedback.style.backgroundColor;
    list = document.getElementById('list');
    list.addEventListener('click', onClick);
}
function onDragEnter(event) {
    event.preventDefault();
    feedback.style.backgroundColor = '#dddddd';
}
function onDragOver(event) {
    event.preventDefault();
}
function onDragLeave(event) {
    feedback.style.backgroundColor = feedback.orgBackground;
}
function onDrop(event) {
    air.trace(event.dataTransfer.types);
    var filelist = event.dataTransfer.getData('application/x-vnd.adobe.air.file-list'),
        urilist = event.dataTransfer.getData('text/uri-list'),
        html = event.dataTransfer.getData('text/html'),
        text = event.dataTransfer.getData('text/plain');
    
    list.innerHTML = '';
    
    if (filelist) {
        air.trace('File or folder dropped: ' + filelist);
        if (filelist.length == 1 && filelist[0].isDirectory) {
            basepath = filelist[0];
        } else {
            basepath = filelist[0].parent;
        }
        loadFiles({ files: filelist });
    } else if (urilist) {
        air.trace('URI dropped: ' + urilist);
    } else if (html) {
        air.trace('HTML dropped (might be a source code or a URI): ' + html);
    } else if (text) {
        // Weird, we never get here, because in case of text/plain alone, getData returns null
        air.trace('Source code dropped (might be a URI): ' + text);
    }
    
    feedback.style.backgroundColor = feedback.orgBackground;
}
function loadFiles(event) {
    var index, file, regex;
    regex = new RegExp("\\.(js|css|html)$", "i");
    for (index in event.files) {
        file = event.files[index];
        if (!file.isHidden) {
            if (file.isDirectory) {
                file.addEventListener('ioError', function () { air.trace('IOError'); });
                file.addEventListener('directoryListing', loadFiles);
                file.getDirectoryListingAsync();
            } else if (file.name.match(regex)) {
                var item = document.createElement('li');
                item.innerHTML = basepath.getRelativePath(file);
                item.file = file;
                list.appendChild(item);
            }
        }
    }
}
function readFile(file) {
    var fileStream = new air.FileStream();
    fileStream.open(file, air.FileMode.READ);
    var fileContent = fileStream.readUTFBytes(fileStream.bytesAvailable);
    fileStream.close();
    return fileContent; //.split(String.fromCharCode(13,10));
}

function doCheckLines(lines) {
	var valid;
	try {
		valid = JSLINT(lines);
	} catch (e) {
		valid = false;
	}
	return valid;
}

function doCheckFile(file) { // returns true if file valid, false if invalid, undefined if not found
    if (true) { //filesystem.itemExists(filepath)) {
        var lines = readFile(file);
        if (lines.length === 0) {
            return true;
        } else {
            return doCheckLines(lines);
        }
    }
}

function onClick(event) {
    var file = event.target.file;
    var result = doCheckFile(file);
    if (result) {
        feedback.innerHTML = "The file is valid!";
    } else {
        feedback.innerHTML = JSLINT.errors[0].reason;
    }
}

function showPreferences() {
	var isVisible = true;
	var scrollBarsVisible = true;
	var windowBounds = new air.Rectangle(200,250,300,400);
	var preferencesLoader = air.HTMLLoader.createRootWindow(isVisible, preferencesWindowOptions(), scrollBarsVisible, windowBounds); 
	preferencesLoader.load(new air.URLRequest("preferences.html"));
}

function preferencesWindowOptions() {
	var options = new air.NativeWindowInitOptions(); 
	//options.systemChrome = "none";
	//options.type = "lightweight";
	return options;
}
