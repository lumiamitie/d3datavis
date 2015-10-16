var aa;
d3.json('boxoffice_data/boxoffice20151015.json', function(data){
	var width = 800, height = 600;
	var margin = {top: 50, right: 20, bottom: 20, left: 100};
	
	var movieList = data.boxOfficeResult.dailyBoxOfficeList;
console.log(movieList)
aa = movieList;
	
	var movieData = movieList.map(function(d){
		return {
			movieNm: d.movieNm,
			audiCnt: +d.audiCnt,
			scrnCnt: +d.scrnCnt
		}
	})
	console.log(movieData);
	
	var svg = d3.select('#main_chart')
			.append('svg')
			.attr('width', width)
			.attr('height', height);
			
	var xScale = d3.scale.linear()
					.domain([0, d3.max(movieData.map(function(d){ return d.scrnCnt; }))])
					.range([0, 600]);
	
	var yScale = d3.scale.linear()
					.domain([0, d3.max(movieData.map(function(d){return d.audiCnt})) + 10])
					.range([500, 0]);
	
	var xAxis = d3.svg.axis()
					.scale(xScale)
					.outerTickSize(1)
					.orient('bottom');
	
	var yAxis = d3.svg.axis()
					.scale(yScale)
					.outerTickSize(1)
					.orient('left');
					
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform','translate('+ margin.left +', 550)')
		.call(xAxis);
	
	svg.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate('+ margin.left +','+ margin.top +')')
		.call(yAxis);
	
	var points = svg.append('g')
					.attr('transform', 'translate(' + margin.left + ','+ margin.top +')')
					.selectAll('.points')
					.data(movieData);
					
	points.enter()
		.append('circle')
		.attr('cx', function(d){ return xScale(d.scrnCnt)})
		.attr('cy', function(d){ return yScale(d.audiCnt)})
		.attr('r', 4);
})