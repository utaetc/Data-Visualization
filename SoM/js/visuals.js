/** Data structure for the data points plotted on the scatter plots. */
class PlotData {
    /**
     * @param id id for the data point
     * @param xVal value for the x variable
     * @param yVal value for the y variable
     */
    constructor (id, xVal, yVal) {
        this.id = id;
        this.xVal = parseInt(xVal);
        this.yVal = parseInt(yVal);
    }

}

/** Class representing all the visual plots. */
class visuals {
    /**
     * @param data the selected data
     * @param custom flag for whether the data is uploaded
     */
    constructor (data, custom) {

        // removes elements in case the webpage is not refreshed 
        // and the user selects a new dataset
        for (let i = 1; i < 5; i++) {
            let div = document.getElementById("chart" + i);
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }

        // removes elements in case the webpage is not refreshed 
        // and the user selects a new dataset
        let divs = ["filter", "filterS", "filterWindow", "filterBlank", 
        "filterSButtons", "filterWindowReset", "idButtonDiv","idWindow"]

        for (let i = 0; i < divs.length; i++) {
            let div = document.getElementById(divs[i]);
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }

        this.margin = {top: 15, right: 30, bottom: 20, left: 30};
        
        this.w = 350 - this.margin.right - this.margin.left;
        this.h = 300 - this.margin.bottom - this.margin.top;

        this.data = data;
        this.resetData = data;
        this.variables = [];
        // slider presence
        this.slider = true;
        // value from slider
        this.filterVal = null;

        if (custom === false) {
            for (let i = 1; i < data.columns.length; i++) {
                this.variables.push(data.columns[i]);
            }
        }
        else if (custom === true) {
            this.variables = Object.keys(data[0])
            this.variables.shift();
        }

        // an abscent value is replaced with -1
        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.variables.length; j++) {
                if (this.data[i][this.variables[j]] === "") {
                    this.data[i][this.variables[j]] = "-1";
                }
            }
        }

        this.catVariables = [];
        this.numVariables = [];

        for (let i = 0; i < this.variables.length; i++) {
            if (this.variables[i].substring(this.variables[i].length - 5) === "Categ") {
                this.catVariables.push(this.variables[i]);
            }
            else {
                this.numVariables.push(this.variables[i]);
            }
        }

        // absent categorical variables are replaced with NA
        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.catVariables.length; j++) {
                if (this.data[i][this.catVariables[j]] === "-1") {
                    this.data[i][this.catVariables[j]] = "NA";
                }
            }
        }

        this.color = d3.scaleOrdinal(d3.schemeAccent)
                .domain([0,this.data.length]);

        // initial indicators for both axis on all plots
        this.xIndicators = [this.numVariables[0], this.numVariables[0], 
                            this.numVariables[0], this.numVariables[0], 
                            this.numVariables[0]];
        this.yIndicators = [this.numVariables[0], this.numVariables[0],
                            this.numVariables[0], this.numVariables[0],
                            this.numVariables[0]];
        // default filter is the first variable
        this.chosenFilter = this.variables[0];
        // variable indicating if the reset button is present
        this.resetPresent = false;
        this.inequality = "";
        this.filterBarVal = 0;
        this.catFilterVal = "";
        // inital test description
        this.initialTextDes = true;
        this.multicompare = false;
        // submitted list of variables
        this.submitVar = [];
        // submitted list of values for each variable
        this.submitVarVal = [];
        // submitted list of inequalities for each numeric variable
        this.submitInequalityList = [];
        // variable indicating if the submit has been pressed
        this.submitOn = false;
        // the leftover data from the previous filtering performed
        this.submittedData = [];
        this.currentTextArr = "Filters Applied <br/>";

        this.drawChart();
        this.drawDropDown();
        this.drawFilterBar();
        this.updateTextDescription();
        this.drawIdButton();
        d3.select("#idWindow").classed("expandedWindow", false);

    }

    /**
     * Sets up the plot, axes, and dropdown menus for each individual chart
     * Sets up the dropdown menu for the filter 
     */
    drawChart () {

        for (let i = 1; i < 5; i++) {
            d3.select('#chart' + i)
                .append('div').attr('id', 'chart-view'+ i);

            d3.select('#chart-view'+i)
                .append('div')
                .attr("class", "tooltip")
                .style("opacity", 0);

            let svg = d3.select("#chart-view" + i)
                .append('svg')
                .classed('plot-svg', true)
                .attr("width", this.w + this.margin.left + this.margin.right)
                .attr("height", this.h + this.margin.top + this.margin.bottom);

            let svgGroup = d3.select('#chart-view' + i).select('.plot-svg').append('g').classed('wrapper-group', true);
    
            let xaxis = svgGroup.append("g")
                .classed("x-axis", true)
                .attr("id", "x-axis" + i);
        
            let yaxis = svgGroup.append("g")
                .classed("y-axis", true)
                .attr("id", "y-axis" + i);
        
            xaxis.append("text")
                .classed("axis-label-x", true)
                .attr("transform", "translate("+(5*this.margin.left)+"," +(2*this.margin.top)+")")
                .attr("text-anchor", "middle")
                .attr("class", "axis-label")
                .attr("class", "x-label")
                .attr("id", "x-label"+i);
        
            yaxis.append("text")
                .classed("axis-label-y", true)
                .attr("transform", "translate(-"+(this.margin.left) + ","+(this.h/2)+")rotate(-90)")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("class", "y-label")
                .attr("id", "y-label"+i);
        
            let dropdownWrap = d3.select('#chart'+i).append('div')
                .classed('dropdown-wrapper', true)
                .attr("id", "dropdown-wrapper"+i);
        
            let xWrap = dropdownWrap.append('div').classed('dropdown-panel', true);
        
            xWrap.append('div').classed('dropdown-label', true)
                .append('text')
                .text('X Axis Data');
        
            xWrap.append('div').attr('id', 'dropdown_x'+i).classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
        
            let yWrap = dropdownWrap.append('div').classed('dropdown-panel', true);
        
            yWrap.append('div').classed('dropdown-label', true)
                .append('text')
                .text('Y Axis Data');
        
            yWrap.append('div').attr('id', 'dropdown_y'+i).classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
        
            d3.selectAll('#dropdown_x')
                .on("change", function (d) {
                    let dropdownX = d;
                })
        
            d3.selectAll('#dropdown_y')
                .on("change", function (d){
                    let dropdownY = d;
                })
        }

        let dropdownWrap = d3.select('#filter').append('div')
                .classed('dropdown-wrapper', true)
                .attr("id", "dropdown-filter");
        
        let filterWrap = dropdownWrap.append('div').classed('dropdown-panel', true);
        
        filterWrap.append('div').classed('dropdown-label', true)
            .append('text')
            .text('Select Data to Filter');
        
        filterWrap.append('div').attr('id', 'dropdown_filter').classed('dropdown', true).append('div').classed('dropdown-content', true)
                .append('select');
        
        d3.selectAll('#dropdown_x')
            .on("change", function (d) {
                let dropdownX = d;
            })
        
    }

    /**
     * Setting up the drop-downs for the charts and the filter
     * @param xIndicator identifies the values to use for the x axis
     * @param yIndicator identifies the values to use for the y axis
     */
    drawDropDown(xIndicator, yIndicator) {

        let that = this;
        let dropData = [];
        let dropFilterData = [];

        for (let key in this.numVariables) {
            dropData.push({
                indicator: this.numVariables[key],
                indicator_name: this.numVariables[key]
            });
        }

        for (let key in this.variables) {
            dropFilterData.push({
                indicator: this.variables[key],
                indicator_name: this.variables[key]
            });
        }

        for (let i = 1; i < 5; i++) {
            let dropDownWrapper = d3.select('#dropdown-wrapper'+i);
            /* X DROPDOWN */
            let dropX = dropDownWrapper.select('#dropdown_x'+i).select('.dropdown-content').select('select');

            let optionsX = dropX.selectAll('option')
                .data(dropData);

            optionsX.exit().remove();

            let optionsXEnter = optionsX.enter()
                .append('option')
                .attr('value', (d, i) => d.indicator);

            optionsXEnter.append('text')
                .text((d, i) => d.indicator_name);

            optionsX = optionsXEnter.merge(optionsX);

            let selectedX = optionsX.filter(d => d.indicator === xIndicator)
                .attr('selected', true);

            dropX.on('change', function (d, i) {
                let xValue = this.options[this.selectedIndex].value;
                let yValue = dropY.node().value;
                let location = d.path[2].id.slice(-1);
                that.updateChart(xValue, yValue,location);
            });

            /* Y DROPDOWN */
            let dropY = dropDownWrapper.select('#dropdown_y'+i).select('.dropdown-content').select('select');

            let optionsY = dropY.selectAll('option')
                .data(dropData);

            optionsY.exit().remove();

            let optionsYEnter = optionsY.enter()
                .append('option')
                .attr('value', (d, i) => d.indicator);

            optionsY = optionsYEnter.merge(optionsY);

            optionsYEnter.append('text')
                .text((d, i) => d.indicator_name);

            let selectedY = optionsY.filter(d => d.indicator === yIndicator)
                .attr('selected', true);

            dropY.on('change', function (d, i) {
                let yValue = this.options[this.selectedIndex].value;
                let xValue = dropX.node().value;
                let location = d.path[2].id.slice(-1);
                that.updateChart(xValue, yValue,location);
            });
        }

        let dropdown_filter = d3.select('#dropdown_filter').select('.dropdown-content').select('select');

        let optionsfilter = dropdown_filter.selectAll('option')
                .data(dropFilterData);

        optionsfilter.exit().remove();

        let optionsfilterEnter = optionsfilter.enter()
                .append('option')
                .attr('value', (d, i) => d.indicator);

            optionsfilter = optionsfilterEnter.merge(optionsfilter);

            optionsfilterEnter.append('text')
                .text((d, i) => d.indicator_name);

            let selectedfilter = optionsfilter.filter(d => d.indicator === yIndicator)
                .attr('selected', true);

            dropdown_filter.on('change', function (d, i) {
                d3.select('#submit').classed("pressed", false);
                let indicator = this.options[this.selectedIndex].value;
                that.chosenFilter = indicator;
                
                if (that.multicompare === false) {
                    that.data = that.resetData;
                }
                if (that.numVariables.indexOf(that.chosenFilter) > -1) {
                    that.drawFilterBar(true);
                }
                else if (that.catVariables.indexOf(that.chosenFilter) > -1) {
                    that.drawCategoryFilter(true);
                }
            });

    }

    /**
     * Updates the data
     * @param xIndicator identifies the values to use for the x axis
     * @param yIndicator identifies the values to use for the y axis
     * @param location identifies which scatter plot will be updated
     */
    updateChart (xIndicator, yIndicator, location) {

        let x_VarIndx = 0;
        let y_VarIndx = 0;
        
        for (let i = 0; i < this.variables.length; i++) {
            if (this.variables[i] === xIndicator) {
                x_VarIndx = i;
            }
            if (this.variables[i] === yIndicator) {
                y_VarIndx = i;
            }
        }

        let x_var = this.variables[x_VarIndx];
        let y_var = this.variables[y_VarIndx];

        this.xIndicators[location] = x_var;
        this.yIndicators[location] = y_var;

        let xdata = [];
        let ydata = [];

        for (let i = 0; i < this.data.length; i++) {
            xdata.push(parseInt(this.data[i][x_var]));
            ydata.push(parseInt(this.data[i][y_var]));
        }

        // gets the full dataset into two arrays for x and y
        // this is necessary for situations where the data has been 
        // filtered completely and does not have a min or max value
        let resetx = [];
        let resety = [];

        for (let i = 0; i < this.resetData.length; i++) {
            resetx.push(parseInt(this.resetData[i][x_var]));
            resety.push(parseInt(this.resetData[i][y_var]));
        }

        let xScale;
        let yScale;

        if (d3.min(xdata) < 0) {
            xScale = d3
                .scaleLinear()
                .domain([d3.min(xdata), d3.max(xdata)])
                .range([0, this.w]);
        }
        else if (d3.min(xdata) >= 0) {
            xScale = d3
                .scaleLinear()
                .domain([0, d3.max(xdata)])
                .range([0, this.w]);
        }
        else {
            xScale = d3
                .scaleLinear()
                .domain([d3.min(resetx), d3.max(resetx)])
                .range([0, this.w]);
        }

        if (d3.min(ydata) < 0) {
            yScale = d3
                .scaleLinear()
                .domain([d3.max(ydata),d3.min(ydata)])
                .range([this.margin.bottom,this.h]); 
        }
        else if (d3.min(ydata) >= 0) {
            yScale = d3
                .scaleLinear()
                .domain([d3.max(ydata),0])
                .range([this.margin.bottom,this.h]);
        } 
        else {
            yScale = d3
                .scaleLinear()
                .domain([d3.max(resety),d3.min(resety)])
                .range([this.margin.bottom,this.h]);
        }

        let xaxis_data = d3.select('#x-axis'+location);

        xaxis_data.call(d3.axisBottom(xScale).ticks(5))
            .attr("transform", "translate("+1.5*this.margin.left+","+this.h+")")
            .attr("class", "axis line");

        let yaxis = d3.select('#y-axis'+location);

        yaxis.call(d3.axisLeft(yScale).ticks(5))
            .attr("transform", "translate("+1.5*this.margin.left+",0)")
            .attr("class", "axis line");

        let xlab = d3.select('#x-label'+location)
            .text(function() { return "" + x_var});

        xlab.attr("text-anchor", "middle")
            .attr("class", "axis label")
            .attr("class", "x-label")
            .attr("fill", "black");

        let ylab = d3.select('#y-label'+location)
            .text(function () { return "" + y_var});

        ylab.attr("text-anchor", "middle")
            .attr("class", "axis label")
            .attr("class", "y-label")
            .attr("fill", "black");

        let plotData_arr = [];

        for (let i = 0; i < this.data.length; i++) {
            let datapoint = new PlotData(this.data[i]["ID"], this.data[i][x_var],
                                        this.data[i][y_var]);
                plotData_arr.push(datapoint);
        }

        let that = this;

        d3.select("#chart-view"+location).select('.plot-svg').selectAll("circle")
            .data(plotData_arr)
            .join("circle")
            .attr('cx', (d) => xScale(d.xVal))
            .attr('cy', (d) => yScale(d.yVal))
            .attr('r', (d) => 3)
            .attr("transform", "translate("+1.5*that.margin.left+",0)")
            .attr("fill", (d,i) => that.color(i))
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("id", function (d,i) { return d.id.toUpperCase() + "" + location});

        let data_circ = d3.selectAll("#chart"+location).selectAll("circle");

        // places each circle into a tooltip
        that.tooltip(data_circ);

    }

    /**
     * Draws the filter Bar slider for numeric variables
     * @param drawn a flag that notifies the program if the filterbar has
     * already been drawn
     */
    drawFilterBar (drawn) {

        if (drawn === true) {
            let div = document.getElementById("filterS")
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            let div2 = document.getElementById("filterSButtons");
            while (div2.firstChild) {
                div2.removeChild(div2.firstChild);
            }
        }

        let that = this;
        that.slider = false;
        // slider scale
        let sScale;
        this.catFilterVal = false;

        let globalvariableVals = [];

        // the following code ensures there is a range for the filter bar slider
        for (let i = 0; i < this.data.length; i++) {
            globalvariableVals.push(parseInt(this.data[i][""+this.chosenFilter]));
        }

        if (d3.min(globalvariableVals) - d3.max(globalvariableVals) !== 0) {
            sScale = d3.scaleLinear()
                    .domain([d3.min(globalvariableVals),d3.max(globalvariableVals)])
                    .range([5, 490]);
        }
        else if (d3.min(globalvariableVals) - d3.max(globalvariableVals) === 0) {
            sScale = d3.scaleLinear()
                    .domain([d3.min(globalvariableVals)-1,d3.max(globalvariableVals)+1])
                    .range([5, 490]);
        }
        
        let sSlider = d3.select('#filterS')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', function () { if (d3.min(globalvariableVals) - d3.max(globalvariableVals) === 0) {
                return d3.min(globalvariableVals) - 1;
            }
            else {
                return d3.min(globalvariableVals);
            }})
            .attr('max', function () { if (d3.min(globalvariableVals) - d3.max(globalvariableVals) === 0) {
                return d3.max(globalvariableVals) + 1;
            }
            else {
                return d3.max(globalvariableVals);
            }})
            .attr('value', this.filterVal);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg').attr("id", "slider-text");

        let sliderText = sliderLabel.append('text')
            .text(this.filterVal);

            sliderText.attr('x', sScale(this.filterVal));
            sliderText.attr('y', 25);

        sSlider.on('input', function () {
            d3.select("#buttonID").classed("pressed", false);
            d3.select('#submit').classed("pressed", false);
            that.slider = true;

            sliderText
                .text(this.value)
                .attr('x', function () {
                    if (this.innerHTML.length >= 2) {
                        if (sScale(this.innerHTML) < 450) {
                            return sScale(this.innerHTML)+9+((1/3)*this.innerHTML.length);
                        }
                        else {
                            return sScale(this.innerHTML)-9-((1/3)*this.innerHTML.length);
                        }
                    }
                    else {
                        return sScale(this.innerHTML)+5;
                    }
                })
                .attr('y', 25)
                .style("font-size", function () { 
                    if (this.innerHTML.length >= 2) {
                        return 12 - (this.innerHTML.length/4);
                    }
                    else {
                        return 12;
                    }
                })
            that.filterData(this.value);
            that.filterBarVal = this.value;

        })

        let text_box = d3.select("#filterWindow")
            .classed("expandedWindow", true);

        if (drawn !== true) {
            let box = d3.select('#filterBlank')
                    .append("svg")
                    .append("rect")
                    .attr('x', 10)
                    .attr('y', 10)
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr("opacity", 0);
        }
        
        let button1 = d3.select('#filterSButtons')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "greaterthan")
                        .style("margin", "5px")
                        .classed("pressed", true);

        let button2 = d3.select('#filterSButtons')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "lesserthan")
                        .style("margin", "5px");

        let button3 = d3.select('#filterSButtons')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "equal")
                        .style("margin", "5px");

        let button4 = d3.select('#filterSButtons')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "submit")
                        .style("margin", "5px");
                        
        document.getElementById("greaterthan").innerHTML = ">";
        document.getElementById("lesserthan").innerHTML = "<";
        document.getElementById("equal").innerHTML = "=";
        document.getElementById("submit").innerHTML = "submit";

        this.inequality = ">";

        let buttons = d3.select('#filterSButtons').selectAll("button");

        buttons.on("click", function (d) {
            d3.select("#buttonID").classed("pressed", false);
            let elem_id = d.srcElement.innerText;

            let inequalityText = "";

            if (elem_id === ">") {
                inequalityText = "greaterthan";
                that.inequality = elem_id;
            }
            else if (elem_id === "<") {
                inequalityText = "lesserthan";
                that.inequality = elem_id;
            }
            else if (elem_id === "=") {
                inequalityText = "equal";
                that.inequality = elem_id;
            }
            else if (elem_id === "submit") {
                that.multicompare = true;
                that.submitOn = true;
                that.submitVar.push(that.chosenFilter);
                that.submitInequalityList.push(that.inequality);

                if (that.numVariables.indexOf(that.chosenFilter) > -1) {
                    that.submitVarVal.push(that.filterBarVal);
                }
            }

            let ids = ["greaterthan", "lesserthan", "equal", "submit"];

            for (let i = 0; i < ids.length; i++) {
                if (inequalityText === ids[i]){
                    d3.select('#'+ids[i]).classed("pressed", true);
                }
                else {
                    d3.select('#'+ids[i]).classed("pressed", false);
                }
            }
            if (elem_id === "submit") {
                d3.select('#'+elem_id).classed("pressed", true);
            }
            that.filterData(that.filterBarVal);
        })

        if (!this.resetPresent) {
            let reset = d3.select('#filterWindowReset')
                .append("button")
                .attr("class", "button")
                .attr("id", "reset")
                .style("margin", "5px");

            document.getElementById("reset").innerHTML = "Reset";
            this.resetPresent = true;
        }

        let resetbutton = d3.select('#filterWindowReset').selectAll("button");

        resetbutton.on("click", function (d) {
            that.resetViz();
        })

    }
    
    /**
     * Draws the category buttons for categorical variables
     * @param drawn a flag that notifies the program if the categories have
     * already been drawn
     */
    drawCategoryFilter (drawn) {
        if (drawn === true) {
            let div = document.getElementById("filterS")
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            let div2 = document.getElementById("filterSButtons");
            while (div2.firstChild) {
                div2.removeChild(div2.firstChild);
            }
        }

        let text_box = d3.select("#filterWindow")
            .classed("expandedWindow", true);

        this.slider = false;

        this.uniqueCateg = [];

        for (let i = 0; i < this.data.length; i++) {
            if (this.uniqueCateg.indexOf(this.data[i][""+this.chosenFilter]) === -1) {
                this.uniqueCateg.push(this.data[i][""+this.chosenFilter]);
            }
        }

        for (let i = 0; i < this.uniqueCateg.length; i++) {
            let button = d3.select('#filterS')
                    .append("button")
                    .attr("class", "button")
                    .attr("id", "" + this.uniqueCateg[i])
                    .style("margin", "5px");       

            document.getElementById("" + this.uniqueCateg[i]).innerHTML = this.uniqueCateg[i];
        }

        let buttonSubmit = d3.select('#filterS')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "submit")
                        .style("margin", "5px");

        document.getElementById("submit").innerHTML = "submit";

        let that = this;

        let buttons = d3.select('#filterS').selectAll("button");

        buttons.on("click", function (d) {
            let elem_id = d.srcElement.innerText;

            if (elem_id === "submit") {
                d3.select('#submit').classed("pressed", true);
                that.multicompare = true;
                that.submitOn = true;
                that.submitVar.push(that.chosenFilter);

                if (that.catVariables.indexOf(that.chosenFilter) > -1) {
                    that.submitVarVal.push(that.catFilterVal)
                }
                for (let i = 0; i < that.uniqueCateg.length; i++) {
                    d3.select("#"+that.uniqueCateg[i]).classed("pressed", false);
                }

                that.filterCatData(that.catFilterVal);
            }
            else {
                d3.select('#submit').classed("pressed", false);

                for (let i = 0; i < that.uniqueCateg.length; i++) {
                    if (elem_id === that.uniqueCateg[i]) {
                        d3.select("#"+that.uniqueCateg[i]).classed("pressed", true);
                    }
                    else {
                        d3.select("#"+that.uniqueCateg[i]).classed("pressed", false);
                    }
                }

                that.catFilterVal = elem_id;
                that.filterCatData();
            }
        })
    }

    /**
     * Filters the data displayed in all of the scatter plots
     * @param value the numeric value that is associated with the inequality
     * (used for providing a threshold for filtering the data)
     */
    filterData (value) {
        let that = this;
        if (this.multicompare === false && this.submitOn === false) {
            this.data = this.resetData;
        }
        if (this.multicompare === true && this.submitOn === false) {
            this.data = this.submittedData;
        }
        
        let newData = [];
        
        if (this.inequality === ">") {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i][that.chosenFilter] > parseInt(value)) {
                    newData.push(this.data[i]);
                }
            }
        }
        else if (this.inequality === "<") {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i][that.chosenFilter] < parseInt(value)) {
                    newData.push(this.data[i]);
                }
            }
        }
        else if (this.inequality === "=") {
            for (let i = 0; i < this.data.length; i++) {
                if (parseInt(this.data[i][that.chosenFilter]) === parseInt(value)) {
                    newData.push(this.data[i]);
                }
            }
        }
    
        this.data = newData;

        // multicompare notifies the program if there are multiple filters
        // the submittedData will store the most recent data points that
        // were kept following the filtering
        if (this.multicompare === true && this.submitOn === true) {
            this.submittedData = this.data;
        }

        for (let i = 1; i < 5; i++) {
            this.updateChart(this.xIndicators[i], this.yIndicators[i], i);
        }

        this.updateTextDescription(value);

    }

    /**
     * Filters the data displayed in all of the scatter plots based on
     * the selected categorical variable
     */
    filterCatData () {
        let that = this;
        if (this.multicompare === false && this.submitOn === false) {
            this.data = this.resetData;
        }
        if (this.multicompare === true && this.submitOn === false) {
            this.data = this.submittedData;
        }

        let newData = [];

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i][that.chosenFilter] === this.catFilterVal) {
                newData.push(this.data[i]);
            }
        }

        this.data = newData;

        // multicompare notifies the program if there are multiple filters
        // the submittedData will store the most recent data points that
        // were kept following the filtering
        if (this.multicompare === true && this.submitOn === true) {
            this.submittedData = this.data;
        }

        for (let i = 1; i < 5; i++) {
            this.updateChart(this.xIndicators[i], this.yIndicators[i], i);
        }

        let value = this.catFilterVal;
        this.updateTextDescription(value);
    }
    
    /**
     * Displays the filters applied to the data set.
     * @param valueSlider the value inputted on the filter bar slider/the
     * category selected on the categorical filter
     */
    updateTextDescription (valueSlider) {

        let infodata = {chosenFilter: this.chosenFilter,
                        value: valueSlider}

        d3.select("#filterWindow").selectAll("text").remove();

        let text_box = d3.select("#filterWindow");

        if (this.catFilterVal === false && this.initialTextDes === false  &&
            this.multicompare === false && this.submitOn === false) {
            text_box.html("Filters Applied <br/>" +
            infodata.chosenFilter + " " + this.inequality + infodata.value);
        }
        else if (this.catFilterVal !== false && this.initialTextDes === false
            && this.multicompare === false && this.submitOn === false) {
            text_box.html("Filters Applied <br/>" +
            infodata.chosenFilter + " = "+ infodata.value);
        }  
        else if (this.initialTextDes === true && this.multicompare === false
            && this.submitOn === false) {
            text_box.html("Filters Applied");
            this.initialTextDes = false;
        } 
        else if (this.multicompare === true && this.submitOn === false) {
            let text_arr = "Filters Applied <br/>";
            let index_of_inequality = 0;

            for (let i = 0; i < this.submitVar.length; i++) {
                text_arr = text_arr + this.submitVar[i];
                if (this.submitVar[i].indexOf("Categ") > -1) {
                    text_arr = text_arr + " = " + this.submitVarVal[i] + "<br/>";
                }
                else {
                    text_arr = text_arr + " ";
                    text_arr = text_arr + this.submitInequalityList[index_of_inequality] 
                            + this.submitVarVal[i] + "<br/>";
                    index_of_inequality = index_of_inequality + 1;
                }
            }
            if (this.catFilterVal === false) {
                text_arr = text_arr + infodata.chosenFilter + " " + this.inequality + infodata.value + "<br/>";
            }
            else if (this.catFilterVal !== false) {
                text_arr = text_arr + infodata.chosenFilter + " = "+ infodata.value + "<br/>";
            }
            text_box.html(text_arr);
            this.currentTextArr = text_arr;
        }
        else if (this.multicompare === true && this.submitOn === true) {
            let text_arr = this.currentTextArr;
            if (this.catFilterVal === false) {
                text_arr = text_arr + infodata.chosenFilter + " " + this.inequality + infodata.value + "<br/>";
            }
            else if (this.catFilterVal !== false) {
                text_arr = text_arr + infodata.chosenFilter + " = "+ infodata.value + "<br/>";
            }
            text_box.html(text_arr);
            this.submitOn = false;
        }

    }

    /**
     * creates a listener for when a user hovers over a data point
     * @param onscreenData
     */
    tooltip (onscreenData) {
        let that = this;
        let tooltip = d3.select('.tooltip');

        onscreenData.on('mouseover', function(d,i) {

            let pageX = d.clientX + 5;
            let pageY = d.clientY + 5;
            
            d3.select(this).classed("hovered",true);
            that.createTempCircle(this, true);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            tooltip.html(that.tooltipDivRender(d))
                .style("left", (pageX) + "px")
                .style("top", (pageY) + "px");
            });

        onscreenData.on("mouseout", function(d,i) {
            d3.select(this).classed("hovered",false);
            that.createTempCircle(this, false);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    }

    /**
     * Returns html that can be used to render the tooltip.
     * @param data the data point that the user is hovering over
     * @returns {string}
     */
    tooltipDivRender (data){
        let id = data.currentTarget.id.slice(0,-1);

        return "<h5>" + id + "<br/>";
    }    

    /**
     * displays a temporary circle over the data point that the user is 
     * hovering over
     * @param item the data point that the user is hovering over
     * @param boolean flag that determines if the temporary circle 
     * should be displayed
     */
    createTempCircle (item, boolean) {

        let this_chart = parseInt(item.id.slice(-1),10);
        let item_id = item.id.slice(0,-1);

        for (let i = 1; i < 5; i++) {
            if (this_chart !== i && boolean === true) {
                let circle = d3.select("#chart-view"+i).select('.plot-svg').select("#"+item_id + i);
                circle.classed('hovered', true);
            }
            else if (this_chart !== i && boolean === false) {
                let circle = d3.select("#chart-view"+i).select('.plot-svg').select("#"+item_id + i);
                circle.classed('hovered', false);
            }
        }

    }
    
    /**
     * creates the button that will display all of the ids for the 
     * displayed data points
     */
    drawIdButton () {

        let button = d3.select('#idButtonDiv')
                        .append("button")
                        .attr("class", "button")
                        .attr("id", "buttonID")
                        .style("margin", "5px");

        document.getElementById("buttonID").innerHTML = "Display Current IDs";

        let idButton = d3.select('#idButtonDiv').selectAll("button");

        let that = this;

        idButton.on("click", function (d) {
            d3.select("#buttonID").classed("pressed", true);
            d3.select("#idWindow").selectAll("text").remove();
                
            let text_box = d3.select("#idWindow").classed("expandedWindow", true);

            let arr_of_ids = [];

            for (let i = 0; i < that.data.length; i++) {
                arr_of_ids.push(that.data[i]["ID"]);
            }

            let max_length_ids = arr_of_ids[0].length;

            for (let i = 0; i < arr_of_ids.length; i++) {
                if (arr_of_ids[i].length > max_length_ids) {
                    max_length_ids = arr_of_ids[i].length;
                }
            }

            if (max_length_ids * arr_of_ids.length > 170) {
                let index = Math.floor(170/max_length_ids);
                for (let i = index; i < arr_of_ids.length; i+=index) {
                    arr_of_ids[i] = arr_of_ids[i] + "<br/>";
                }
            }

            text_box.html("Current IDs <br/>" + arr_of_ids);
        })

    }

    /**
     * Resets the entire visualization to the starting point
     * (removes all filters and resets to the original dataset with
     * the default dropdown settings)
     */
    resetViz() {
        for (let i = 1; i < 5; i++) {
            let div = document.getElementById("chart" + i);
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }

        let divs =["filter", "filterS", "filterWindow", "filterBlank", 
        "filterSButtons", "filterWindowReset", "idButtonDiv","idWindow"]

        for (let i = 0; i < divs.length; i++) {
            let div = document.getElementById(divs[i]);
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }

        this.data = this.resetData;
        this.slider = true;
        this.filterVal = null;

        this.chosenFilter = this.variables[0];
        this.resetPresent = false;
        this.inequality = "";
        this.filterBarVal = 0;
        this.catFilterVal = "";
        this.initialTextDes = true;
        this.multicompare = false;
        this.submitVar = [];
        this.submitVarVal = [];
        this.submitInequalityList = [];
        this.submitOn = false;
        this.submittedData = [];
        this.currentTextArr = "Filters Applied <br/>";

        this.drawChart();
        this.drawDropDown();
        this.drawFilterBar();
        this.drawIdButton();

        for (let i = 1; i < 5; i++) {
            this.updateChart(0,1,i);
        }

        this.updateTextDescription();

        d3.select("#idWindow").classed("expandedWindow", false);
        d3.select('#submit').classed("pressed", false);
    }
}