/** The script to run the program on the webpage. */

/**
* Loads the demo data into an object.
*/
async function loadexampleData () {
    let data_demo = await d3.csv("./data/demo.csv");

    let dataobject = {
        "demo": data_demo
    }
    return dataobject;
}

let exampleData = loadexampleData();

Promise.all([exampleData]).then(data => {

    let preData = data[0];

    /**
     * Updates the data that will be used in the visualizations.
     * @param id the ID object for the newly selected data
     * @param data the data matrix that has been selected
     */
    function updateData (id, data) {
        if (id === "demo") {
            selectedData.newData(preData["demo"]);
            selectedData.preloaded = true;
            document.getElementById('csvUpload').value= null;
            d3.select("#demoButton").classed("button_select", true);
        }
        else if (id === "custom") {
            selectedData.newData(data);
            selectedData.preloaded = false;
            d3.select("#demoButton").classed("button_select", false);
        }
    }

    /**
     * Initiates the creation of the various data visualizations.
     * @param data the data that will be visualized
     * @param custom a flag that alerts the program is the data is uploaded
     * from an outside source
     */
    function performAnalysis (data, custom) {
        if (data === null) {
            alert("Error! Select Demo or Upload Data");
        }
        else {
            let plots = new visuals(data, custom);
            for (let i = 1; i < 5; i++) {
                plots.updateChart(0,1,i);
            }
        }
    }

    let selectedData = new dataSelection (preData, updateData, performAnalysis);
})