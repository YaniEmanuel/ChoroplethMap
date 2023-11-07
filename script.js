document.addEventListener("DOMContentLoaded", () => {
    // Ancho y alto del mapa
    const width = 960;
    const height = 600;
  
    // Crea un lienzo SVG para el mapa
    const svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Carga los datos de los archivos JSON
    Promise.all([
      d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
      d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
    ]).then(data => {
      const countiesData = topojson.feature(data[0], data[0].objects.counties);
      const educationData = data[1];
  
      // Crea una escala de colores para asignar colores a los condados
      const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(educationData, d => d.bachelorsOrHigher)])
        .range(["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f"]);
  
      // Crea el mapa de coropletas
      svg.selectAll("path")
        .data(countiesData.features) // Modificado
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => {
          const countyData = educationData.find(item => item.fips === d.id);
          return countyData ? countyData.bachelorsOrHigher : 0;
        })
        .attr("fill", d => {
          const countyData = educationData.find(item => item.fips === d.id);
          return countyData ? colorScale(countyData.bachelorsOrHigher) : "#ccc";
        })
        .attr("d", d3.geoPath())
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
  
      // Crea la leyenda
      const legendColors = colorScale.range();
      legendColors.push("#ccc");
  
      legendColors.forEach((color, i) => {
        const item = document.getElementById("legend").appendChild(document.createElement("div"));
        item.className = "legend-item";
        item.innerHTML = `
          <div class="legend-color" style="background-color: ${color}"></div>
          <div>${i * 20}% - ${i * 20 + 20}%</div>
        `;
      });
  
      // Función para mostrar el tooltip
      function showTooltip(event, d) {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "block";
        tooltip.style.left = event.pageX + 10 + "px";
        tooltip.style.top = event.pageY - 60 + "px";
        tooltip.setAttribute("data-education", d3.select(this).attr("data-education"));
        tooltip.innerHTML = `FIPS: ${d.id}<br>Education: ${d3.select(this).attr("data-education")}%`;
      }
  
      // Función para ocultar el tooltip
      function hideTooltip() {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
      }
    });
  });   