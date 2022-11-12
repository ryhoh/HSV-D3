const HSV_CONF = {
    colors: [
        "#9B59B6",
        "#3498DB",
        "#2ECC71",
        "#1ABC9C",
        "#F1C40F",
        "#E67E22",
        "#E74C3C",
    ],
}

const hsv_pickColor = (idx, color_table) => color_table[idx % color_table.length];
const hsv_round = (value) => Math.round(value * 1000) / 1000;

const hsv_tooltip = (selector) => d3.select(selector)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-size", "16px")
    .style("position", "absolute")
    .style("color", "white")
    .style("background-color", "#34495E")
    .style("padding", "10px")
    .style("border", "solid 1px white")
    .style("border-radius", "5px");
const hsv_mousemove = (tooltip) => function(d) {
    tooltip
        .style("top", (d.pageY - 20) + "px")
        .style("left", (d.pageX + 10) + "px");
}
const hsv_mouseover = (tooltip, htmlBuilder) => function(d) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 1);
    tooltip
        .html(htmlBuilder(d))
        .style("top", (d.pageY - 20) + "px")
        .style("left", (d.pageX + 10) + "px");
}
const hsv_mouseleave = (tooltip) => function(_) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
}
