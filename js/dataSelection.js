/** This class manages the user's demo data selection or csv file upload. */  

class dataSelection {
    /**
     * @param data the data loaded in from the demo file
     * @param updateData a callback function used to notify other parts of the 
     * program when data has been selected (uploaded or clicked)
     * @param performAnalysis a callback fuction used to used to notify other 
     * parts of the program when the Perform Analysis button is clicked
     */
    constructor (data, updateData, performAnalysis) {
        this.data = data;
        // updateData is the callback function to updateData in script.js
        this.updateData = updateData;
        // performAnalysis is the callback function to performAnalysis in script.js
        this.performAnalysis = performAnalysis;
        this.custom = false;

        let that = this;

        let demoData = d3.select("#demoButton");

        demoData.on("click", function() {
            d3.select("#demoButton").classed("button_select", true);
            that.updateData("demo");
        });

        let csv_file = d3.select("#csvUpload");
        csv_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toObjects(textData[0]);
                that.custom = true;
                document.getElementById("demoButton").style.color = "white"
                document.getElementById("demoButton").style.backgroundColor = "rgb(134, 124, 189)"
                that.updateData("custom", customData);
            }
        });

        let performButton = d3.select("#performButton");
        performButton.on("click", function () {
            that.performAnalysis(that.data, that.custom);
        });

    }

    /**
     * Assigns the newly selected data into a variable wihtin the program.
     * @param data newly selected data
     */
    newData (data) {
        this.data = data;
    }
}