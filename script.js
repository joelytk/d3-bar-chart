const projectName = 'bar-chart';

const width = 800;
const height = 400;

const fetchData = async () => {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
    );
    const data = await res.json();
    createBarChart(data);
  } catch (error) {
    console.error({ error });
  }
};

const createBarChart = data => {
  const { data: dataset, from_date, to_date } = data;
  const barWidth = width / dataset.length;

  const getQuarter = date =>
    `Q${Math.floor((new Date(date).getMonth() + 3) / 3)}`;

  const getYear = date => Number(date.split('-')[0]);

  // Initialize the x and y scales
  const xScale = d3.scaleTime(
    [new Date(from_date), new Date(to_date)],
    [0, width]
  );
  const yScale = d3.scaleLinear([0, d3.max(dataset, d => d[1])], [height, 0]);

  // Initialize the x and y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Create the SVG element
  const svg = d3
    .select('.bar-chart-container')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height + 60);

  // Create the tooltip
  const tooltip = d3
    .select('.bar-chart-container')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  // Add the axes and their labels
  svg
    .append('text')
    .attr('id', 'x-axis-label')
    .attr('x', 485)
    .attr('y', 453)
    .attr('fill', '#fff')
    .attr('font-size', '0.8rem')
    .attr('text-anchor', 'middle')
    .text('Year');
  svg
    .append('text')
    .attr('id', 'y-axis-label')
    .attr('x', 20)
    .attr('y', 230)
    .attr('fill', '#fff')
    .attr('font-size', '0.8rem')
    .attr('text-anchor', 'middle')
    .text('GDP');
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(80, 420)`)
    .call(xAxis);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(80, 20)`)
    .call(yAxis);

  // Create the bars, then add class and titles
  svg
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', d => xScale(new Date(d[0])) + 80)
    .attr('y', d => yScale(d[1]) + 20)
    .attr('width', barWidth)
    .attr('height', d => height - yScale(d[1]))
    .attr('class', 'bar')
    .attr('data-date', d => d[0])
    .attr('data-gdp', d => d[1])
    .on('mouseover', e => {
      const [date, value] = e.target.__data__;
      const post2007 = getYear(date) >= 2007;

      tooltip
        .style('opacity', 1)
        .style(
          'top',
          `${post2007 ? window.event.pageY : window.event.pageY - 5}px`
        )
        .style(
          'left',
          `${post2007 ? window.event.pageX - 5 : window.event.pageX}px`
        )
        .style('width', 'max-content')
        .style(
          'transform',
          post2007 ? 'translate(-100%, -50%)' : 'translate(-50%, -100%)'
        )
        .attr('class', post2007 ? 'tooltip-left' : 'tooltip-top')
        .attr('data-date', date).html(`
          <span>${getQuarter(date)} ${getYear(date)}</span>
          <br />
          <span>$${value.toLocaleString()} billion</span>
        `);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
};

fetchData();
