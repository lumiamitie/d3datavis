var margin = { top: 10, right: 30, bottom: 10, left: 30 },
    width = 556 - margin.left - margin.right,
    height = 733 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2 - 40,
    upperpie_height = height / 2;

var svg = d3.select('#chart02').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

// 윗부분 파이차트 : 1DAY
var svg_upperpie = svg.append('g')
    .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (margin.top + height/2 - radius*0.7) + ')');

// 아랫부분 파이차트 : 1WEEK
var svg_lowerpie = svg.append('g')
	.attr('transform', 'translate(' + (margin.left + width/2) + ',' + (margin.top + height/2 + radius*0.9) + ')')

// 날짜 파싱 함수
var parseDate = d3.time.format("%Y%m%d").parse,
	returnDate = d3.time.format("%m/%d");

var test;

d3.json('chart02_pie_1.json', function(error, data){
	if(error) throw error;
test = data;
	// 채널별 합계
	var chnl_sum = d3.nest()
					.key(function(d){return d.chnl;})
					.rollup(function(d){return d3.sum(d, function(e){return e.value})})
					.entries(data);
	// pie layout -> 파이차트를 위한 데이터 생성
	var pie = d3.layout.pie()
				.sort(null)
				.padAngle(Math.PI / 360 * 2)
				.value(function(d){ return d.values ;});
	// 파이 차트의 부채꼴 모양 구성
	var arc = d3.svg.arc()
			.outerRadius(radius - 85)
			.innerRadius(70);
	// 파이 차트 바깥에 label을 배열하기 위한 path 함수
	var labelArc = d3.svg.arc()
				.outerRadius(radius - 65)
				.innerRadius(radius - 65);
	// 아랫 파이차트에 데이터 입력
	var lower_pie = svg_lowerpie.selectAll('.lower_pie')
								.data(pie(chnl_sum))
								.enter().append('g')
									.attr('class', 'lower pie');
	// 아랫 파이차트 제목								
	lower_pie.append('text')
		.attr('x', 0)
		.attr('y', -radius+60)
		.style('text-anchor', 'middle')
		.attr('class', 'pie_title')
		.text('1WEEK');
	// 아랫 파이차트의 채널별로 파이 그리기
	lower_pie.append('path')
		.attr('d', arc)
		.attr('class', function(d){return 'pie_' + d.data.key; })
	// 가운데 들어갈 기간 문구
	var week_label = d3.extent(data, function(d){return d.date})
						.map(function(d){return returnDate(parseDate(d))});
	// 파이차트 바깥쪽 label
	lower_pie.append('text')
		.attr('transform', function(d){ return 'translate(' + labelArc.centroid(d) + 0 + ')'; })
		//.attr('y', '.35em')
		.style('text-anchor', 'middle')
		.text(function(d){ 
			if(d.data.values > 0){ 
				return d.data.values + '건';
			}else{
				return undefined;	
			} })
		.attr('class', 'pie_count_text');
	// 파이차트 가운데 기간 표시
	lower_pie.append('text')
			.text(week_label[0] + '~' + week_label[1])
			.attr('x', 0)
			.attr('y', '0.5em')
			.style('text-anchor', 'middle')
			.attr('class', 'pie_date');


	//upper pie
	//1DAY
	//최근 날짜
	var latest_day = d3.max(data, function(d){ return d.date });

	// 채널명
	var chnl_latest= data.filter(function(d){return d.date === latest_day})
						 .map(function(d){return {chnl: d.chnl, values: d.value}});
	// 윗쪽 파이차트에 데이터 입력
	var upper_pie = svg_upperpie.selectAll('.upper_pie')
								.data(pie(chnl_latest))
								.enter().append('g')
									.attr('class', 'upper pie');
	// 윗쪽 파이차트 제목
	upper_pie.append('text')
		.attr('x', 0)
		.attr('y', -radius+50)
		.style('text-anchor', 'middle')
		.attr('class', 'pie_title')
		.text('1DAY');
	// 윗쪽 파이차트 구성하기
	upper_pie.append('path')
		.attr('d', arc)
		.attr('class', function(d){return 'pie_' + d.data.chnl;});
	// 윗쪽 파이차트 label
	upper_pie.append('text')
		.attr('transform', function(d){ return 'translate(' + labelArc.centroid(d) + 0 + ')'; })
		.attr('y', '.35em')
		.style('text-anchor', 'middle')
		.text(function(d){ 
			if(d.data.values > 0){ 
				return d.data.values + '건';
			}else{
				return undefined;	
			} })
		.attr('class', 'pie_count_text');
	// 윗쪽 파이차트 날짜(파이차트 가운데)
	upper_pie.append('text')
				.text(returnDate(parseDate(latest_day)))
				.attr('x', 0)
				.attr('y', '0.5em')
				.style('text-anchor', 'middle')
				.attr('class', 'pie_date')
	// 범례 구성을 위한 채널 목록
	var chnl_list = d3.nest().key(function(d){ return d.chnl}).entries(data).map(function(d){return d.key});
	// 범례가 들어갈 그룹 구성
	var legend = svg.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + (margin.top + height - 120) + ')')
					.attr('class', 'pie_legend');
					
	// 범례 사각형 -> 모서리가 약간 둥글게
	legend.selectAll('rect').data(chnl_list)
			.enter().append('rect')
			.attr('x', 0)
			.attr('y', function(d, i){ return (i * 1.5) + 'em'; })
			.attr('rx', 2)
			.attr('ry', 2)
			.attr('width', 30)
			.attr('height', 5)
			.attr('class', function(d){ return 'pie_' + d; });
	// 범례 텍스트
	legend.selectAll('text').data(chnl_list)
			.enter().append('text')
			.attr('x', 35)
			.attr('y', function(d, i ){return (i * 1.5 + 0.5) + 'em'; })
			.attr('class', function(d){ return 'pie_' + d; })
			.text(function(d){
				var ko_chnl = {twitter: "트위터", community: "커뮤니티", blog: "블로그", news: "뉴스", reply: "댓글", voc: "VOC"}
				return ko_chnl[d]; 
			})

})