var margin = { top: 30, right: 40, bottom: 30, left: 40 },
    width = 556 - margin.left - margin.right,
    height = 733 - margin.top - margin.bottom,
    header_height = 100;

var svg = d3.select('#chart04').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  

var svg_header = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var svg_chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top + header_height) + ')')
    .attr('id', 'network_chart');

var test;
d3.json('chart04_network.json', function(error, data){
	if(error) throw error;
//test = data;

	var change_range = function(node_data, element){
		var chart = d3.select('#network_chart'),
			dayweek = d3.select(element);
		
		if(dayweek.classed('network_selected')){
			
		}else{

			d3.select('#range')
				.select('.network_selected')
				.classed({'network_selected':false, 'network_unselected':true});

			dayweek.classed({'network_selected':true, 'network_unselected':false})
			
			chart.selectAll('*').remove();
			draw_network(node_data);
		};
	};

	var data_range = svg_header.append('g')
								.attr('id', 'range');

	var day_1 = data_range.append('text')
						.attr('x', width/2 - 20)
						.attr('y', header_height/2)
						.attr('class', 'network_dayweek network_selected')
						.style('text-anchor', 'end')
						.on('click', function(){ change_range(data.day, this); })
						.text('1DAY');

	var week_1 = data_range.append('text')
						.attr('x', width/2 + 20)
						.attr('y', header_height/2)
						.attr('class', 'network_dayweek network_unselected')
						.style('text-anchor', 'start')
						.on('click', function(){ change_range(data.week, this); })
						.text('1WEEK');						

	var main_kwd = data.main_kwd,
		main_kwd_r = 80;

	var collide = function (node) {
		  var r = node.value + main_kwd_r,
		      nx1 = node.x - r,
		      nx2 = node.x + r,
		      ny1 = node.y - r,
		      ny2 = node.y + r;
		  return function(quad, x1, y1, x2, y2) {
		    if (quad.point && (quad.point !== node)) {
		      var x = node.x - quad.point.x,
		          y = node.y - quad.point.y,
		          l = Math.sqrt(x * x + y * y),
		          r = node.value + quad.point.value;
		      if (l < r) {
		        l = (l - r) / l * .8;
		        node.x -= x *= l;
		        node.y -= y *= l;
		        quad.point.x += x;
		        quad.point.y += y;
		      }
		    }
		    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		  };
		};

	var draw_network = function(node_data){

		var node_value = node_data.map(function(d){ return +d.value; }),
			scale_r = d3.scale.linear()
						.domain(d3.extent(node_value))
						.range([30, 50]);


		var day_node = [];
		day_node[0] = { keywd: main_kwd, 
						value: main_kwd_r};
		node_data.forEach(function(d, i){
			day_node[i+1] = { keywd: d.keywd, 
							  value: scale_r(d.value) }; 
		});

		var day_link = [];

		d3.range(day_node.length)
			.filter(function(d){return d !== 0; })
			.forEach(function(d,i){ 
				day_link[i] = {source: d, target: 0};
			});

		var force = d3.layout.force()
						.size([width, height - header_height])
						.nodes(day_node)
						.links(day_link)
						.linkDistance(function(d, i){
							var distance = i % 2 === 1 ? width/3 : width/2;
							return distance;
						})
						.charge(-500)
						.start();

		var links = svg_chart.selectAll('.network_link')
							.data(day_link)
							.enter().append('line')
								.attr('class', 'network_line');

		var nodes = svg_chart.selectAll('.network_node')
							.data(day_node)
							.enter().append('g');

		nodes.append('circle')
			.attr('class', function(d, i) { 
				if( i === 0){
					return 'network_node network_node_center'
				} else {
					return i % 2 === 1 ? 'network_node network_node_color1': 'network_node network_node_color2'; 	
				}
			})
			.attr('r', function(d) { return d.value; })
			.call(force.drag);

		nodes.append('text')
			.style('text-anchor', 'middle')
			.attr('dy', '0.3em')
			.attr('class', 'network_label')
			.text(function(d) { return d.keywd; });			

		force.on('tick', function(){
			var q = d3.geom.quadtree(day_node);

			//Collision Detection
			day_node.forEach(function(d){ q.visit(collide(d)); })

			nodes
				.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });

			links.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });
		});
	}

	draw_network(data.day);

	

});