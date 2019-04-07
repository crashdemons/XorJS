/* 
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/ .
 */



class UI{
    static load(){
        UI.xorProcessor = new ChunkedXorProcessor(4096);
        UI.xorProcessor.progress_callback = UI.updateProgress;
        UI.entries=[];
        UI.outputEntry = new OutputEntry();
        UI.fileTrigger = $("#ui-addfile-trigger");
        UI.entryContainer = $("#ui-entry-container");
        UI.outputContainer = $("#ui-output-container");
        
        UI.outputContainer.append(UI.outputEntry.createElement());
        
        console.log("loading ui events");
        UI.fileTrigger.on('change',UI.handleFileSelect);
        UI.outputEntry.load();  
        UI.outputEntry.bind('output-button','click',UI.combineAndDownload);
    }
    
    static updateProgress(nchunks){
        var len = nchunks * UI.xorProcessor.chunk_size;
        //console.log("updateprogress "+len)
        UI.outputEntry.setComplete(len);
    }
    
    static clearEntries(){
        for(var id in UI.entries){
            UI.removeEntry(id);
        }
        UI.xorProcessor.removeSources();
    }
    
    static removeEntry(id){
        UI.xorProcessor.removeSource( UI.entries[id].data.xor_source_id );//remove datasource from ChunkedXorProcessor!
        

        UI.entries[id].getElement().remove();
        delete UI.entries[id];
        UI.updateOutputSize();
        UI.updateProgress(0);
        //UI.entries.splice(id, 1);//this would reorder the indices
    }
    
    static updateOutputSize(){
        UI.outputEntry.setSize(UI.xorProcessor.getShortestLength());
    }
    
    static addEntry(entry){
        UI.entries[entry.id]=entry;
        entry.updateCallback=UI.updateOutputSize;
        UI.entryContainer.append(entry.createElement());
        entry.load();
        var _id = entry.id;
        entry.bind('entry-close','click',function(){
            console.log("close "+_id);
            UI.removeEntry(_id);
        });
        UI.updateProgress(0);
    }
    
    
    static addFile(){//NOTE: must be called from a user interaction event
        UI.fileTrigger.show();
        UI.fileTrigger.trigger('click');//open file select window
        UI.fileTrigger.hide();
    }
    
    static addConstantGenerator(){
        var source = new GeneratorWindow('constant',constant_generator,0);
        var chunkedsource = UI.xorProcessor.prepareDataSource(source);
        var entry = new ConstantGeneratorEntry(chunkedsource);
        UI.addEntry(entry);
    }
    
    
    static download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }
    
    
    static combineAndDownload(){
        UI.updateProgress(0);
        UI.xorProcessor.prepareSelection();
        UI.xorProcessor.prepareBuffer();
        UI.xorProcessor.xorDataSources().then(function(buffer){
            UI.download(buffer,"output.bin","application/octet-stream");
            UI.xorProcessor.releaseBuffer();
            console.log("done saving");
        });
    }
    
    static handleFileSelect(evt) {
        console.log("file select "+evt);
	var files = evt.target.files; // FileList object

	// use the 1st file from the list
	var f = files[0];

        var source = new FileWindow(f);
        var chunkedsource = UI.xorProcessor.prepareDataSource(source);
        var entry = new FileEntry(chunkedsource);
        
        UI.addEntry(entry);
        
        
        /*
        //TODO: this stuff, in an event
        window.xorp = new ChunkedXorProcessor(2);
        window.cfile = xorp.prepareDataSource(xfile);
        
        
        window.xconst = new GeneratorWindow('constant/1',constant_generator,1);
        window.cconst = xorp.prepareDataSource(xconst);
        
        
        xorp.prepareSelection();
        xorp.prepareBuffer();
        
        console.log(xorp.output_buffer);
        window.xor_done = xorp.xorDataSources();*/
    }
}


$(function(){
    UI.load();
});