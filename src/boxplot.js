function boxplot(
    selector,
    data,
    category,
    target,
    range,
    title = "",
    plot_size = 400,
    colors = HSV_CONF.colors,
) {
    // handle args
    if (title == "") {
        title = target;
    }

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const padding = { top: 30, right: 0, bottom: 0, left: 0};
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
            const q1 = d3.quantile(d.map(g => g[target]).sort(d3.ascending), .25);
            const median = d3.quantile(d.map(g => g[target]).sort(d3.ascending), .5);
            const q3 = d3.quantile(d.map(g => g[target]).sort(d3.ascending), .75);
            const interQuantileRange = q3 - q1;
            const min = q1 - 1.5 * interQuantileRange;
            const max = q3 + 1.5 * interQuantileRange;
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
    );

    const naive_stat = {};
    for (let category_cur of sumstat.keys()) {
        const q1 = d3.quantile(data.filter(g => g[category] == category_cur).map(g => g[target]).sort(d3.ascending), .25);
        const q3 = d3.quantile(data.filter(g => g[category] == category_cur).map(g => g[target]).sort(d3.ascending), .75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;
        naive_stat[category_cur] = {
            "min": min,
            "max": max,
        }
    }

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
        .range([plot_height, padding.top]);
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
    svg
        .selectAll("outliers")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[category]))
        .attr("cy", d => y(d[target]))
        .attr("r", 4)
        .style("fill", "white")
        .style("opacity", d => {
            if (naive_stat[d[category]]["min"] <= d[target] && d[target] <= naive_stat[d[category]]["max"]) {
                return "0%";
            }
        })
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

    // Show title
    svg
        .append("text")
        .text(title)
        .attr("x", (plot_width / 2) - margin.left)
        .attr("y", margin.top)
        .style("text-align", "center");
}