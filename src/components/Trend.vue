<template>
	<div class="com-container">
		<div class="title" :style="comStyle">
			<span>{{ "▎ " + showTitle }}</span>
			<span
				class="iconfont title-icon"
				:style="comStyle"
				@click="showChoice = !showChoice"
				>&#xe6eb;</span
			>
			<div class="select-con" v-show="showChoice" :style="marginStyle">
				<div
					class="select-item"
					v-for="item in selectType"
					:key="item.key"
					@click="handleSelect(item.key)"
				>
					{{ item.text }}
				</div>
			</div>
		</div>
		<div class="com-chart" ref="trend_ref"></div>
	</div>
</template>

<script>
	import { mapState } from "vuex";
	import {getThemeValue} from "@/utils/theme_utils"
	export default {
		data() {
			return {
				chartInstane: null,
				allData: null, //从服务器拿到的数据
				showChoice: false, //是否显示可选项
				choiceType: "map", //显示数据的类型
				titleFontSize: 0 // 指明标题的字体大小
			};
		},
		created() {
			// 当socket来数据的时候,会调用getData这个函数
			this.$socket.registerCallBack("trendData", this.getData);
		},
		mounted() {
			this.initData();
			// this.getData();
			this.$socket.send({
				action: "getData",
				socketType: "trendData",
				chartName: "trend",
				value: ""
			});
			window.addEventListener("resize", this.screenAdapter);
			// 加载页面成功对页面进行适配
			this.screenAdapter();
		},
		Unmounted() {
			window.removeEventListener("resize", this.screenAdapter);
			this.$socket.UnregisterCallBack("trendData");
		},

		computed: {
			selectType() {
				if (!this.allData) {
					return [];
				} else {
					return this.allData.type.filter(item => {
						return item.key != this.choiceType;
					});
				}
			},
			showTitle() {
				if (!this.allData) {
					return "";
				} else {
					return this.allData[this.choiceType].title;
				}
			},
			comStyle() {
				return {
					fontSize: this.titleFontSize + "px",
					color: getThemeValue(this.theme).titleColor
				};
			},
			marginStyle() {
				return {
					marginLeft: this.titleFontSize + "px",
					backgroundColor: getThemeValue(this.theme).backgroundColor,
					color: getThemeValue(this.theme).titleColor
				};
			},
			...mapState(["theme"])
		},
		watch: {
			theme() {
				this.chartInstane.dispose(); // 销毁当前的图表
				this.initData(); // 重新以最新的主题名称初始化图表对象
				this.screenAdapter(); // 完成屏幕的适配
				this.updateChart(); // 更新图表的展示
			}
		},
		methods: {
			// 初始化echart数据
			initData() {
				this.chartInstane = this.$echart.init(this.$refs.trend_ref, this.theme);
				const initOption = {
					grid: {
						left: "3%",
						right: "4%",
						top: "35%",
						bottom: "1%",
						containLabel: true //是否包含文字
					},
					legend: {
						left: 20,
						top: "15%",
						icon: "circle"
					},
					tooltip: {
						trigger: "axis"
					},
					xAxis: {
						type: "category",
						boundaryGap: false
					},
					yAxis: {
						type: "value"
					}
				};
				this.chartInstane.setOption(initOption);
			},
			getData(ret) {
				// 对allData进行赋值
				this.allData = ret;
				this.updateChart();
			},
			updateChart() {
				// 处理数据
				// 半透明的颜色值
				const colorArr1 = [
					"rgba(11, 168, 44, 0.5)",
					"rgba(44, 110, 255, 0.5)",
					"rgba(22, 242, 217, 0.5)",
					"rgba(254, 33, 30, 0.5)",
					"rgba(250, 105, 0, 0.5)"
				];
				// 全透明的颜色值
				const colorArr2 = [
					"rgba(11, 168, 44, 0)",
					"rgba(44, 110, 255, 0)",
					"rgba(22, 242, 217, 0)",
					"rgba(254, 33, 30, 0)",
					"rgba(250, 105, 0, 0)"
				];
				// 类目轴数据
				const timeArr = this.allData.common.month;
				// y轴数据 series下的数据
				const valueArr = this.allData[this.choiceType].data;
				const seriesArr = valueArr.map((item, index) => {
					return {
						data: item.data,
						name: item.name,
						type: "line",
						stack: this.choiceType,
						areaStyle: {
							color: new this.$echart.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: colorArr1[index] }, //百分之0
								{ offset: 1, color: colorArr2[index] } //百分之100
							])
						}
					};
				});
				// 图例的数据
				const legendArr = valueArr.map(item => item.name);
				const dataOption = {
					xAxis: {
						data: timeArr
					},
					legend: {
						data: legendArr
					},
					series: seriesArr
				};
				this.chartInstane.setOption(dataOption);
			},
			// 自适应
			screenAdapter() {
				this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
				const adapterOption = {
					legend: {
						itemWidth: this.titleFontSize,
						itemHeight: this.titleFontSize,
						itemGap: this.titleFontSize,
						textStyle: {
							fontSize: this.titleFontSize / 2
						}
					}
				};
				this.chartInstane.setOption(adapterOption);
				this.chartInstane.resize();
			},
			// 选择展示哪个类型数据
			handleSelect(currentType) {
				this.choiceType = currentType;
				this.updateChart();
				this.showChoice = false;
			}
		}
	};
</script>

<style scoped lang='less'>
	.title {
		position: absolute;
		left: 20px;
		top: 20px;
		z-index: 10;
		color: white;
		.title-icon {
			margin-left: 10px;
			cursor: pointer;
		}
		.select-con {
			background-color: #222733;
		}
	}
</style>