<template>
	<div class="com-container">
		<div class="com-chart" ref="rank_ref"></div>
	</div>
</template>

<script>
	import { mapState } from "vuex";
	export default {
		data() {
			return {
				chartInstance: null,
				allDate: null,
				startValue: 0, //区域缩放的起始点
				endValue: 9, //区域缩放的结束点
				timeId: null
			};
		},
		created() {
			this.$socket.registerCallBack("rankData", this.getData);
		},
		mounted() {
			this.initData();
			this.$socket.send({
				action: "getData",
				socketType: "rankData",
				chartName: "rank",
				value: ""
			});
			window.addEventListener("resize", this.screenAdapter);
			this.screenAdapter();
		},
		Unmounted() {
			window.removeEventListener("resize", this.screenAdapter);
			clearInterval(this.timeId);
			this.$socket.UnregisterCallBack("rankData");
		},
		methods: {
			initData() {
				this.chartInstance = this.$echart.init(this.$refs.rank_ref, this.theme);
				const initOption = {
					title: {
						text: "▎ 地区销售排行",
						left: 20,
						top: 20
					},
					tooltip: {
						show: true
					},
					grid: {
						top: "40%",
						left: "5%",
						bottom: "5%",
						right: "5%",
						containLabel: true
					},
					xAxis: {
						type: "category"
					},
					yAxis: {
						type: "value"
					},
					series: [{ type: "bar" }]
				};
				this.chartInstance.on("mouseover", () => {
					clearInterval(this.timeId);
				});
				this.chartInstance.on("mouseout", () => {
					this.startInterval();
				});
				this.chartInstance.setOption(initOption);
			},
			getData(ret) {
				// 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
				this.allDate = ret;
				// 对数据进行从小到大的排序
				this.allDate.sort((a, b) => {
					return b.value - a.value;
				});
				this.updateChart();
				this.startInterval();
			},
			updateChart() {
				// 处理需要的数据
				const colorArr = [
					["#0BA82C", "#4FF778"],
					["#2E72BF", "#23E5E5"],
					["#5052EE", "#AB6EE5"]
				];
				const provinceArr = this.allDate.map(item => item.name);
				const valueArr = this.allDate.map(item => item.value);
				const dataOption = {
					xAxis: {
						data: provinceArr
					},
					dataZoom: {
						show: false,
						startValue: this.startValue,
						endValue: this.endValue
					},
					series: [
						{
							data: valueArr,
							itemStyle: {
								color: arg => {
									let targetColorArr = colorArr[0];
									if (arg.value > 300) {
										targetColorArr = colorArr[0];
									} else if (arg.value > 200) {
										targetColorArr = colorArr[1];
									} else {
										targetColorArr = colorArr[2];
									}
									return new this.$echart.graphic.LinearGradient(0, 0, 0, 1, [
										{ offset: 0, color: targetColorArr[0] },
										{ offset: 1, color: targetColorArr[1] }
									]);
								}
							}
						}
					]
				};
				this.chartInstance.setOption(dataOption);
			},
			screenAdapter() {
				const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
				const adapterOption = {
					title: {
						textStyle: {
							fontSize: titleFontSize
						}
					},
					series: [
						{
							barWidth: titleFontSize,
							itemStyle: {
								barBorderRadius: [0.5 * titleFontSize, 0.5 * titleFontSize, 0, 0]
							}
						}
					]
				};
				this.chartInstance.setOption(adapterOption);
				this.chartInstance.resize();
			},
			// 开启区域定时器
			startInterval() {
				if (this.timeId) {
					clearInterval(this.timeId);
				}
				this.timeId = setInterval(() => {
					this.startValue++;
					this.endValue++;
					if (this.endValue > this.allDate.length - 1) {
						this.startValue = 0;
						this.endValue = 9;
					}
					this.updateChart();
				}, 2000);
			}
		},
		computed:{
			...mapState(["theme"])
		},
		watch :{
			theme () {
				this.chartInstance.dispose();
				this.initData();
				this.screenAdapter();
				this.updateChart()
			}
		}
	};
</script>

<style scoped>
</style>