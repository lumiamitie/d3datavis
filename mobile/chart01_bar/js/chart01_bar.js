var margin = { top: 40, right: 50, bottom: 100, left: 50 },
    width = 556 - margin.left - margin.right,
    height = 733 - margin.top - margin.bottom;

var today_height = 150;

var svg = d3.select('#chart01').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

var svg_today = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var svg_chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top + today_height) + ')');

var parseDate = d3.time.format("%Y%m%d").parse,
	returnDate = d3.time.format("%m/%d");

d3.json('chart01_bar.json', function(error, data){
	
	var data_date = data.map(function(d){ 
		return { date: parseDate(d.date), 
				 value: +d.value
				}; 
	});
	
	var buzz_map = d3.map(data_date, function(d){return +d.date})
	var today_buzz = buzz_map.get(d3.max(buzz_map.keys())).value

	svg_today.append('text')
		.text('TODAY BUZZ')
		.style('text-anchor', 'middle')
		.attr('x', width/2)
		.attr('y', 50)
		.attr('class', 'today bar_buzz_title');

	svg_today.append('text')
		.text(today_buzz)
		.style('text-anchor', 'middle')
		.attr('x', width/2)
		.attr('y', 100)
		.attr('class', 'today bar_buzz_value');

	var x = d3.scale.ordinal()
				.domain(data_date.map(function(d){ return d.date; }))
				.rangeRoundBands([0, width], 0.3, 0.3);

	var y = d3.scale.linear()
				.domain([0, d3.max(data_date, function(d){ return d.value}) + 30])
				.range([height - today_height, 0]);

	var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.outerTickSize(0)
					.ticks(7)
					.tickFormat(returnDate)
					.tickPadding(10);

	var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.innerTickSize(-width)
					.ticks(5)
					.outerTickSize(0)
					.tickPadding(10);

	svg_chart.append("g")
		.attr("class", "bar_x bar_axis")
		.attr('transform', 'translate(' + 0 + ',' + (height - today_height) + ')')
		.call(xAxis);

	svg_chart.append("g")
		.attr('class', "bar_y bar_axis")
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
		.call(yAxis);

	var yAxis_tip = d3.select('.bar_y').selectAll('.tick')
						.append('circle')
						.attr('r', 3)
						.attr('class', 'bar_y bar_tips');
	// 0의 Tip을 제거
	yAxis_tip[0][0].remove();

	var t_today = textures.lines()
		.orientation("horizontal")
		.size(5)
		.strokeWidth(3)
		.stroke('#65c3df')

	var t = textures.lines()
		.orientation("horizontal")
		.size(5)
		.strokeWidth(3)
		.stroke('#ccc')

	svg_chart.call(t);
	svg_chart.call(t_today);

		
	var bar = svg_chart.selectAll(".bar")
		.data(data_date)
		.enter().append('rect')
		    .attr('x', function(d){ return x(d.date) + 10; })
		    .attr('y', function(d){ return y(d.value); })
		    .attr('width', 20)
		    .attr('height', function(d){ return (height - today_height) - y(d.value); })
		    .attr('class', "bar")
		    .style('fill', t.url())
		    .style('fill', function(d, i){
		    	if(i === 6){
		    		return t_today.url();
		    	} else {
		    		return t.url();
		    	}
		    });
})