var margin = { top: 50, right: 50, bottom: 80, left: 50 },
    width = 556 - margin.left - margin.right,
    height = 733 - margin.top - margin.bottom,
    title_height = 150;

var svg = d3.select('#chart03').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  
var svg_chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + (title_height + margin.top) + ')');

var parseDate = d3.time.format("%Y%m%d").parse,
    returnDate = d3.time.format("%m/%d");


var test;
d3.json('chart03_sentiment.json', function(error, data){
test = data;

	if(error) throw error;

	var parsed_date = data.map(function(d) {return parseDate(d.date); }),
		max_value = d3.max(data.map(function(d){return +d.value})),
		latest_date = d3.max(data.map(function(d){ return d.date; }));

	// title /////////////////////////////////
	var svg_title = svg.append('g')
		.attr('transform', 'translate(' + ((width + margin.left + margin.right)/2) + ',' + margin.top + ')');

	// TODAY 텍스트
	svg_title.append('text')
		.attr('x', 0)
		.attr('y', 30)
		.attr('class', 'sentiment_title')
		.style('text-anchor', 'middle')
		.text('TODAY');

	// 데이터의 값을 찾기 편하게 d3.map 지정
	var latest_value = d3.map(data.filter(function(d){ return d.date === latest_date; }), 
							  function(d){ return d.sentiment; });

	// today 숫자값들에 대한 설정을 먼저 적용
	var title_value = svg_title.append('text')
						.attr('x', 0)
						.attr('y', title_height/2 + 30)
						.attr('class', 'sentiment_title_value')
						.style('text-anchor', 'middle');
	
	// 텍스트의 일부분에만 속성을 적용하기 위해 tspan을 사용한다						
	title_value.append('tspan')
				.attr('class', 'sentiment_pos')
				.text(latest_value.get('positive').value);

	title_value.append('tspan')
				.attr('class', 'sentiment_slash')
				.text(' / ');

	title_value.append('tspan')
				.attr('class', 'sentiment_neg')
				.text(latest_value.get('negative').value);

	// scale /////////////////////////////////
	var x = d3.time.scale()
				.domain(d3.extent(parsed_date))
				.range([0, width]);

	var y = d3.scale.linear()
				.domain([-max_value-5, max_value+5])
				.range([height - title_height - margin.bottom, 0]);

	// axis //////////////////////////////////////////////////////
	var xAxis = d3.svg.axis()
					.scale(x)
					.tickFormat(returnDate)
					.orient("bottom")
					.tickPadding(10)
					.ticks(7)
					.outerTickSize(0);

	var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.ticks(5)
					.tickPadding(10)
					.innerTickSize(-width)
					.outerTickSize(0);

	svg_chart.append('g')
		.attr('class', "sentiment_x sentiment_axis")
		.attr('transform', 'translate(' + 0 + ',' + (height - title_height - margin.bottom) + ')')
		.call(xAxis);

	svg_chart.append('g')
		.attr('class', "sentiment_y sentiment_axis")
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
		.call(yAxis);

	// area //////////////////////////////////////////////////////

	var area = d3.svg.area()
				.x(function(d) { return x(d.date); })
				.y0(function(d) { return y(0); })
				.y1(function(d) { return y(d.value); })
				.interpolate('monotone');

	// positive area /////////////////////////////////////////////
	var pos_data = data.filter(function(d){return d.sentiment === "positive"})
						.map(function(d) { return {date: parseDate(d.date), value: +d.value}; });

	var pos_graph = svg_chart.append('g')
			.attr('class', "sentiment_pos")
	
	pos_graph.append('path')
			.attr('class', "sentiment_area")
			.attr('d', area(pos_data));

	pos_graph.selectAll('circle.sentiment_pos')
		.data(pos_data)
		.enter().append('circle')
			.attr('cx', function(d) { return x(d.date); })
			.attr('cy', function(d) { return y(d.value); })
			.attr('r', 5)
			.attr('class', "sentiment_pos");

	// negative area /////////////////////////////////////////////
	var neg_data = data.filter(function(d){return d.sentiment === "negative"})
						.map(function(d) { return {date: parseDate(d.date), value: -d.value}; });

	var neg_graph = svg_chart.append('g')
			.attr('class', 'sentiment_neg')
		
	neg_graph.append('path')
			.attr('class', 'sentiment_area')
			.attr('d', area(neg_data));

	neg_graph.selectAll('circle.sentiment_neg')
		.data(neg_data)
		.enter().append('circle')
			.attr('cx', function(d) { return x(d.date); })
			.attr('cy', function(d) { return y(d.value); })
			.attr('r', 5)
			.attr('class', 'sentiment_neg');
})