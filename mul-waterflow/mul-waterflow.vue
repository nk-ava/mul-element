<template>
  <view class="mul-waterflow" :style="[{height: totalHeight }]">
    <view class="flow-item" v-for="(item, index) in list" :key="index" :style="[itemStyles[index]]">
      <slot name="item" :data="item"></slot>
    </view>
    <view style="position: fixed; left: 10px; top: 20px; background-color: #007aff" @tap="reFlow">重排</view>
  </view>
</template>

<script>
const findMinValueIndex = (list) => {
  const length = list?.length;
  if (!length) {
    throw new Error("Illegal argument list")
  }
  let index = 0;
  let min = list[0];
  for (let i = index + 1; i < list.length; i++) {
    if (list[i] < min) {
      index = i;
      min = list[i];
    }
  }
  return index;
}
export default {
  name: "MulWaterflow",
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    column: {
      type: Number,
      default: () => 0
    },
    rowGap: {
      type: Number,
      default: () => 0
    },
    columnGap: {
      type: Number,
      default: () => 0
    }
  },
  data() {
    return {
      totalHeight: 0,
      oldLength: 0,
      itemStyles: []
    }
  },
  methods: {
    reFlow() {
      const query = uni.createSelectorQuery().in(this);
      query.selectAll(".flow-item")
          .fields({
            size: true
          }, (data) => {
            const length = data.length;
            const addItems = data.slice(this.oldLength);
            addItems.forEach((item, index) => {
              const minIndex = findMinValueIndex(this.colHeight);
              const width = 100 / this.column;
              this.$set(this.itemStyles, index + this.oldLength, {
                padding: `${this.rowGap / 2}px ${this.columnGap / 2}px`,
                top: this.colHeight[minIndex] + 'px',
                left: width * minIndex + '%',
                width: width + '%'
              })
              this.colHeight[minIndex] += item.height;
            })
            this.oldLength = length;
            this.totalHeight = Math.max(...this.colHeight) + 'px';
          }).exec()
    },
    allReFlow() {
      this.colHeight.fill(0);
      this.oldLength = 0;
      const width = 100 / this.column;
      this.itemStyles.forEach((item, index) => {
        item.width = width + '%';
        item.top = 0;
        item.left = width * (index % this.column) + '%';
      })
      this.totalHeight = '';
      setTimeout(this.reFlow, 200);
    }
  },
  computed: {
    colHeight() {
      return Array.from({length: this.column}, () => 0)
    }
  },
  watch: {
    list: {
      handler(newValue) {
        const length = newValue.length;
        const addItems = Array.from({length: length - this.oldLength}, (_, index) => {
          const colIndex = (this.oldLength + index) % this.column;
          const width = 100 / this.column;
          return {
            padding: `${this.rowGap / 2}px ${this.columnGap / 2}px`,
            top: this.colHeight[colIndex] + 'px',
            width: width + '%',
            left: width * colIndex + '%'
          }
        })
        this.itemStyles.push(...addItems);
        this.$nextTick(this.reFlow)
      },
      immediate: true,
      deep: true
    },
    column: {
      handler() {
        this.allReFlow();
      }
    },
    device() {
      this.allReFlow();
    }
  }
}
</script>

<style scoped lang="css">
.mul-waterflow {
  width: 100%;
  height: 100%;
  position: relative;
}

.mul-waterflow .flow-item {
  position: absolute;
  box-sizing: border-box;
  transition: all .2s ease-out;
}
</style>