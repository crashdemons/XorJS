/* 
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/ .
 */

/**
 * Defines an input data source with a selectable, exportable data range.
 * 
 * Child classes are responsible for slicing the selection when overriding selectPos or getSelectionArrayBuffer
 * @author crashdemons
 * @type {Object}
 */
class DataWindow{
	constructor(type,shortname,reference,realsize){
		this.type=type;//the type of the input source
		this.shortname=shortname;
		this.reference=reference;//an internal reference to the data source' origin
		this.realsize=realsize;//the size of the data source
		this.realend=realsize-1;//the end of the data source

		this.selection_start=0;//the start of the user-selected data range
		this.selection_end=this.realend;//...
		this.selection_length=this.realsize;//...
		this.selection_reference=this.reference;//an internal reference to the selected data representation
	}

	static calcSelectEnd(start,length){
		return start + length - 1;
	}

	validateSelection(start,end){
		return (start>=0 && end>=0 && start<=end && start<=this.realend && end<=this.realend);
	}

	selectPos(start,end){
		this.selection_start=start;
		this.selection_end=end;
		this.selection_length=(this.selection_end - this.selection_start)+1;
	}
	getSelectionArrayBuffer(){
		return Promise.resolve( new ArrayBuffer(this.selection_length) );
	}

}