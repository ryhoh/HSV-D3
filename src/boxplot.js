function boxplot(
    selector,
    data,
    category,
    target,
    range,
    plot_size = 400,
    colors = HSV_CONF.colors,
) {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const plot_width = plot_size - margin.left - margin.right;
    const plot_height = plot_size - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", plot_width + margin.left + margin.right)
        .attr("height", plot_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    const sumstat = d3.rollup( // nest function allows to group the calculation per level of a factor
        data,
        d => {
            q1 = d3.quantile(d.map(g => g[target]).sort(d3.ascending),.25);
            median = d3.quantile(d.map(g => g[target]).sort(d3.ascending),.5);
            q3 = d3.quantile(d.map(g => g[target]).sort(d3.ascending),.75);
            interQuantileRange = q3 - q1;
            min = q1 - 1.5 * interQuantileRange;
            max = q3 + 1.5 * interQuantileRange;
            return ({
                q1: q1,
                median: median,
                q3: q3,
                interQuantileRange: interQuantileRange,
                min: min,
                max: max
            });
        },
        d => d[category],
    )

    // Show the X scale
    const x = d3.scaleBand()
        .range([0, plot_width])
        .domain(sumstat.keys())
        .paddingInner(1)
        .paddingOuter(.5);
    svg.append("g")
        .attr("transform", "translate(0," + plot_height + ")")
        .call(d3.axisBottom(x));

    // Show the Y scale
    const y = d3.scaleLinear()
        .domain(range)
        .range([plot_height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const tooltip = hsv_tooltip(selector);
    const mousemove = hsv_mousemove(tooltip);
    const mouseleave = hsv_mouseleave(tooltip);
    const mouseover = hsv_mouseover(tooltip, d =>
`<span>
    Max: ${hsv_round(d["path"][0]["__data__"][1]["max"])}<br>
    Q3: ${hsv_round(d["path"][0]["__data__"][1]["q3"])}<br>
    Median: ${hsv_round(d["path"][0]["__data__"][1]["median"])}<br>
    Q1: ${hsv_round(d["path"][0]["__data__"][1]["q1"])}<br>
    Min: ${hsv_round(d["path"][0]["__data__"][1]["min"])}<br>
</span>`
);

    // Show the main vertical line
    svg
        .selectAll("vertLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => x(d[0]))
        .attr("x2", d => x(d[0]))
        .attr("y1", d => y(d[1]["min"]))
        .attr("y2", d => y(d[1]["max"]))
        .attr("stroke", "black")
        .style("width", 40)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // rectangle for the main box
    const box_width = plot_size / 4;

    svg
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", d => (x(d[0]) - box_width / 2))
        .attr("y", d => (y(d[1].q3)))
        .attr("height", d => (y(d[1].q1)-y(d[1].q3)))
        .attr("width", box_width)
        .attr("stroke", "black")
        .style("fill", (_, idx) => hsv_pickColor(idx, colors))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Show the median
    svg
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => (x(d[0]) - box_width / 2))
        .attr("x2", d => (x(d[0]) + box_width / 2))
        .attr("y1", d => (y(d[1].median)))
        .attr("y2", d => (y(d[1].median)))
        .attr("stroke", "black")
        .style("width", 80)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Show outliers
    // console.log(sumstat[0]);
    svg
        .selectAll("outliers")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[category]))
        .attr("cy", d => y(d[target]))
        .attr("r", 4)
        .style("fill", "white")
        // .style("opecity", d => {
        //     if (sumstat[d[category]]
        // })
        .attr("stroke", "black");

    // Show min and max horizontal lines
    svg
        .selectAll("toto")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => (x(d[0]) - box_width / 2))
        .attr("x2", d => (x(d[0]) + box_width / 2))
        .attr("y1", d => (y(d[1].min)))
        .attr("y2", d => (y(d[1].min)))
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    svg
        .selectAll("toto")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", d => (x(d[0]) - box_width / 2))
        .attr("x2", d => (x(d[0]) + box_width / 2))
        .attr("y1", d => (y(d[1].max)))
        .attr("y2", d => (y(d[1].max)))
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
}