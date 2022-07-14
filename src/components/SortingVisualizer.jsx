import React, { Component } from 'react'
import Bar from './Bar'
import TextContainer from './TextContainer'

const DEFAULT_VALUE = 10
const BLUE = '#c7e4ff'
const LIGHT_BLUE = '#bbfaf8'
const RED = '#ff9494'
const GREEN = '#b3ffc3'
const PURPLE = '#e3c7ff'
const DURATION = 500

export default class SortingVisualizer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: DEFAULT_VALUE,
      bars: []
    }
    this.isSorting = false
  }

  componentDidMount = () => this.generateBars(DEFAULT_VALUE)

  // Bar Functions

  createBar = (num, i, color, value) => {
    const spacing = getSpacing()
    const width = getBarWidth(value, spacing)
    const heightPercentage = getMaxBarHeight() / 100
    const height = heightPercentage * num
    const left = (width + spacing) * i
    return <Bar key={i} width={width} height={height} left={left} color={color} num={num} />
  }

  generateBars = value => {
    const bars = []
    for (let i = 0; i < value; i++) {
      const num = randomBetween(5, 100)
      const bar = this.createBar(num, i, BLUE, value)
      bars.push(bar)
    }
    this.setState({ bars })
  }

  updateBar = (bars, num, i, color, value) => {
    bars[i] = this.createBar(num, i, color, value)
    this.setState({ bars })
  }

  resetBars = (bars, N) => {
    bars.forEach((bar, i) => {
      const num = bar.props.num
      bars[i] = this.createBar(num, i, BLUE, N)
    })
    this.setState({ bars })
  }

  finalizeBars = (bars, N) => {
    let time = 0
    bars.forEach((bar, i) => {
      setTimeout(() => {
        const num = bar.props.num
        bars[i] = this.createBar(num, i, GREEN, N)
        this.setState({ bars })
      }, time)
      time += this.time(N)
    })

    setTimeout(() => this.isSorting = false, time)
  }

  // Handle Functions

  handleSampleChange = evt => {
    const value = evt.target.value
    this.setState({ value })
    if (!this.isSorting) {
      this.generateBars(value)
    }
  }

  handleSortClick = async () => {
    if (this.isSorting || this.state.bars.length !== parseInt(this.state.value)) return
    this.isSorting = true

    const bars = this.state.bars.slice()
    const A = bars.map(bar => bar.props.num)
    const N = this.state.value
    const time = this.time(N)
    let isSuccessful = true

    this.resetBars(bars, N)

    const dropdown = document.getElementById('dropdown')
    switch (dropdown.value) {
      case 'Bitonic Sort': {
        const failed = await this.bitonicSort(bars, A, N, time)
        if (failed) {
          isSuccessful = false
        }
        break
      } case 'Bogo Sort': {
        const failed = await this.bogoSort(bars, A, N, time)
        if (failed) {
          isSuccessful = false
        }
        break
      } case 'Bubble Sort':
        await this.bubbleSort(bars, A, N, time)
        break
      case 'Cocktail Sort':
        await this.cocktailSort(bars, A, N, time)
        break
      case 'Gnome Sort':
        await this.gnomeSort(bars, A, N, time)
        break
      case 'Heap Sort':
        await this.heapSort(bars, A, N, time)
        break
      case 'Insertion Sort':
        await this.insertionSort(bars, A, N, time)
        break
      case 'Merge Sort':
        await this.mergeSort(bars, A, N, time)
        break
      case 'Quick Sort':
        await this.quickSort(bars, A, N, time)
        break
      case 'Radix Sort':
        await this.radixSort(bars, A, N, time)
        break
      case 'Selection Sort':
        await this.selectionSort(bars, A, N, time)
        break
      case 'Shell Sort':
        await this.shellSort(bars, A, N, time)
        break
      default:
        alert("Please choose a sorting algorithm!")
        isSuccessful = false
        this.isSorting = false
    }

    if (isSuccessful) {
      this.finalizeBars(bars, N)
    }
  }

  handleResetClick = () => {
    if (!this.isSorting) {
      this.generateBars(this.state.value)
    }
  }

  // Sorting Functions

  time = N => DURATION / N

  bitonicSort = async (bars, A, N, time) => {
    const helper = async (low, count, isAscending) => {
      if (count <= 1) return

      const k = count / 2
      await helper(low, k, true)
      await helper(low + k, k, false)
      await bitonicMerge(low, count, isAscending)
    }

    const bitonicMerge = async (low, count, isAscending) => {
      if (count <= 1) return

      for (let i = low; i < low + count; i++) {
        this.updateBar(bars, A[i], i, RED, N)
      }
      await new Promise(res => setTimeout(res, time))

      const k = count / 2
      for (let i = low; i < low + k; i++) {
        this.updateBar(bars, A[i], i, LIGHT_BLUE, N)
        this.updateBar(bars, A[i + k], i + k, LIGHT_BLUE, N)
        await new Promise(res => setTimeout(res, time))

        if ((A[i] > A[i + k]) === isAscending) {
          const temp = A[i]
          A[i] = A[i + k]
          A[i + k] = temp

          this.updateBar(bars, A[i], i, LIGHT_BLUE, N)
          this.updateBar(bars, A[i + k], i + k, LIGHT_BLUE, N)
          await new Promise(res => setTimeout(res, time))
        }

        this.updateBar(bars, A[i], i, RED, N)
        this.updateBar(bars, A[i + k], i + k, RED, N)
        await new Promise(res => setTimeout(res, time))
      }

      for (let i = low; i < low + count; i++) {
        this.updateBar(bars, A[i], i, BLUE, N)
      }
      await new Promise(res => setTimeout(res, time))

      await bitonicMerge(low, k, isAscending)
      await bitonicMerge(low + k, k, isAscending)
    }

    const isLoggable = n => {
      while (n > 1) {
        if (n % 2 === 0) {
          n >>= 1
        } else {
          return false
        }
      }
      return true
    }

    if (isLoggable(N)) {
      await helper(0, N, true)
      return false
    } else {
      alert('Number of elements must be a power of 2!')
      this.isSorting = false
      return true
    }
  }

  bogoSort = async (bars, A, N, time) => {
    const permutation = (bank, arr) => {
      if (bank.length === 0) return [arr]

      const perms = []

      bank.forEach((num, i) => {
        const newBank = bank.slice(0, i).concat(bank.slice(i + 1))
        const newArr = arr.slice()
        newArr.push(num)
        perms.push(...permutation(newBank, newArr))
      })

      return perms
    }

    const isSorted = arr => {
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) {
          return false
        }
      }
      return true
    }
    try {
      const perms = permutation(A, [])

      for (let i = 0; i < perms.length; i++) {
        for (let j = 0; j < N; j++) {
          this.updateBar(bars, perms[i][j], j, BLUE, N)
        }
        await new Promise(res => setTimeout(res, time))
        if (isSorted(perms[i])) break
      }

      return false
    } catch (err) {
      alert(err)
      this.isSorting = false
      return true
    }
  }

  bubbleSort = async (bars, A, N, time) => {
    for (let i = N - 1; i > 0; i--) {
      let isSorted = true
      for (let j = 0; j < i; j++) {
        this.updateBar(bars, A[j], j, RED, N)
        this.updateBar(bars, A[j + 1], j + 1, RED, N)
        await new Promise(res => setTimeout(res, time))


        if (A[j] > A[j + 1]) {
          const temp = A[j]
          A[j] = A[j + 1]
          A[j + 1] = temp

          this.updateBar(bars, A[j], j, RED, N)
          this.updateBar(bars, A[j + 1], j + 1, RED, N)

          isSorted = false
          await new Promise(res => setTimeout(res, time))
        }

        this.updateBar(bars, A[j], j, BLUE, N)
        this.updateBar(bars, A[j + 1], j + 1, BLUE, N)
        await new Promise(res => setTimeout(res, time))
      }
      if (isSorted) break
    }
  }

  cocktailSort = async (bars, A, N, time) => {
    for (let start = 0, end = N - 1; start < end; start++) {
      let startSorted = true
      let endSorted = true

      for (let i = start; i < end; i++) {
        this.updateBar(bars, A[i], i, RED, N)
        this.updateBar(bars, A[i + 1], i + 1, RED, N)
        await new Promise(res => setTimeout(res, time))

        if (A[i] > A[i + 1]) {
          const temp = A[i]
          A[i] = A[i + 1]
          A[i + 1] = temp

          this.updateBar(bars, A[i], i, RED, N)
          this.updateBar(bars, A[i + 1], i + 1, RED, N)

          startSorted = false
          await new Promise(res => setTimeout(res, time))
        }

        this.updateBar(bars, A[i], i, BLUE, N)
        this.updateBar(bars, A[i + 1], i + 1, BLUE, N)
        await new Promise(res => setTimeout(res, time))
      }

      end--

      if (!startSorted) {
        for (let i = end; i > start; i--) {
          this.updateBar(bars, A[i], i, RED, N)
          this.updateBar(bars, A[i - 1], i - 1, RED, N)
          await new Promise(res => setTimeout(res, time))

          if (A[i] < A[i - 1]) {
            const temp = A[i]
            A[i] = A[i - 1]
            A[i - 1] = temp

            this.updateBar(bars, A[i], i, RED, N)
            this.updateBar(bars, A[i - 1], i - 1, RED, N)

            endSorted = false
            await new Promise(res => setTimeout(res, time))
          }

          this.updateBar(bars, A[i], i, BLUE, N)
          this.updateBar(bars, A[i - 1], i - 1, BLUE, N)
          await new Promise(res => setTimeout(res, time))
        }
      }

      if (startSorted || endSorted) break
    }
  }

  gnomeSort = async (bars, A, N, time) => {
    let i = 0
    while (i < N) {
      this.updateBar(bars, A[i], i, RED, N)
      if (i !== 0) {
        this.updateBar(bars, A[i - 1], i - 1, RED, N)
      }
      await new Promise(res => setTimeout(res, time))

      if (i === 0 || A[i] >= A[i - 1]) {
        this.updateBar(bars, A[i], i, BLUE, N)
        if (i !== 0) {
          this.updateBar(bars, A[i - 1], i - 1, BLUE, N)
        }
        await new Promise(res => setTimeout(res, time))

        i++
      } else {
        const temp = A[i]
        A[i] = A[i - 1]
        A[i - 1] = temp

        this.updateBar(bars, A[i], i, RED, N)
        this.updateBar(bars, A[i - 1], i - 1, RED, N)
        await new Promise(res => setTimeout(res, time))

        this.updateBar(bars, A[i], i, BLUE, N)
        this.updateBar(bars, A[i - 1], i - 1, BLUE, N)
        await new Promise(res => setTimeout(res, time))

        i--
      }
    }
  }

  insertionSort = async (bars, A, N, time) => {
    for (let i = 1; i < N; i++) {
      for (let j = i; j > 0; j--) {
        let isSorted = true

        this.updateBar(bars, A[j], j, RED, N)
        this.updateBar(bars, A[j - 1], j - 1, RED, N)
        await new Promise(res => setTimeout(res, time))

        if (A[j - 1] > A[j]) {
          const temp = A[j - 1]
          A[j - 1] = A[j]
          A[j] = temp

          this.updateBar(bars, A[j], j, RED, N)
          this.updateBar(bars, A[j - 1], j - 1, RED, N)

          isSorted = false
          await new Promise(res => setTimeout(res, time))
        }

        this.updateBar(bars, A[j], j, BLUE, N)
        this.updateBar(bars, A[j - 1], j - 1, BLUE, N)
        await new Promise(res => setTimeout(res, time))

        if (isSorted) break
      }
    }
  }

  mergeSort = async (bars, A, N, time) => {
    const I = A.map((_, i) => i)

    const helper = async (arr, indices) => {
      if (arr.length === 1) return arr

      const m = Math.floor(arr.length / 2)
      const l = await helper(arr.slice(0, m), indices.slice(0, m))
      const r = await helper(arr.slice(m), indices.slice(m))
      return merge(l, r, indices)
    }

    const merge = async (l, r, indices) => {
      const unsortedArr = l.concat(r)

      for (let i = 0; i < indices.length; i++) {
        this.updateBar(bars, unsortedArr[i], indices[i], RED, N)
      }
      await new Promise(res => setTimeout(res, time))

      const arr = []

      while (l.length !== 0 && r.length !== 0) {
        if (l[0] > r[0]) {
          arr.push(r.shift())
        } else {
          arr.push(l.shift())
        }
      }

      while (l.length !== 0) {
        arr.push(l.shift())
      }

      while (r.length !== 0) {
        arr.push(r.shift())
      }

      for (let i = 0; i < indices.length; i++) {
        if (A[indices[i]] !== arr[i]) {
          this.updateBar(bars, arr[i], indices[i], RED, N)
          A[indices[i]] = arr[i]
          await new Promise(res => setTimeout(res, time))
        }

        this.updateBar(bars, arr[i], indices[i], BLUE, N)
        await new Promise(res => setTimeout(res, time))
      }

      return arr
    }

    await helper(A, I)
  }

  quickSort = async (bars, A, N, time) => {
    const helper = async (l, h) => {
      if (l < h) {
        const pivot = await partition(l, h)
        await helper(l, pivot)
        await helper(pivot + 1, h)
      }
    }

    const partition = async (l, h) => {
      const pivot = A[l]
      let i = l
      let j = h

      this.updateBar(bars, pivot, l, PURPLE, N)

      for (let idx = l + 1; idx < h; idx++) {
        this.updateBar(bars, A[idx], idx, RED, N)
      }

      await new Promise(res => setTimeout(res, time))

      while (i < j) {
        do {
          i++

          if (i !== h) {
            this.updateBar(bars, A[i], i, LIGHT_BLUE, N)
            await new Promise(res => setTimeout(res, time))

            if (A[i] <= pivot) {
              this.updateBar(bars, A[i], i, RED, N)
              await new Promise(res => setTimeout(res, time))
            }
          }
        } while (i !== h && A[i] <= pivot)

        do {
          j--

          if (j !== l && j !== i) {
            this.updateBar(bars, A[j], j, LIGHT_BLUE, N)
            await new Promise(res => setTimeout(res, time))

            if (A[j] > pivot) {
              this.updateBar(bars, A[j], j, RED, N)
              await new Promise(res => setTimeout(res, time))
            }
          }
        } while (j !== l && A[j] > pivot)

        if (i < j) {
          const temp = A[i]
          A[i] = A[j]
          A[j] = temp

          this.updateBar(bars, A[i], i, LIGHT_BLUE, N)
          this.updateBar(bars, A[j], j, LIGHT_BLUE, N)
          await new Promise(res => setTimeout(res, time))
        }

        if (i !== h) {
          this.updateBar(bars, A[i], i, RED, N)
        }

        if (j !== l) {
          this.updateBar(bars, A[j], j, RED, N)
        }

        if (i !== h || j !== l) {
          await new Promise(res => setTimeout(res, time))
        }
      }

      if (j !== l) {
        this.updateBar(bars, A[j], j, LIGHT_BLUE, N)
        await new Promise(res => setTimeout(res, time))

        const temp = A[l]
        A[l] = A[j]
        A[j] = temp

        this.updateBar(bars, A[j], j, PURPLE, N)
        this.updateBar(bars, A[l], l, LIGHT_BLUE, N)
        await new Promise(res => setTimeout(res, time))
      }

      for (let idx = l; idx < h; idx++) {
        this.updateBar(bars, A[idx], idx, BLUE, N)
      }
      await new Promise(res => setTimeout(res, time))

      return j
    }

    await helper(0, N)
  }

  radixSort = async (bars, A, N, time) => {
    const max = A.reduce((curr, prev) => curr > prev ? curr : prev)

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const count = new Array(10).fill(0)
      const output = new Array(N)

      for (let i = 0; i < N; i++) {
        const digit = Math.floor(A[i] / exp) % 10
        count[digit]++
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1]
      }

      for (let i = N - 1; i >= 0; i--) {
        const digit = Math.floor(A[i] / exp) % 10
        output[count[digit] - 1] = A[i]
        count[digit]--
      }

      for (let i = 0; i < N; i++) {
        this.updateBar(bars, A[i], i, RED, N)
        await new Promise(res => setTimeout(res, time))

        A[i] = output[i]
        this.updateBar(bars, A[i], i, RED, N)
        await new Promise(res => setTimeout(res, time))

        this.updateBar(bars, A[i], i, BLUE, N)
      }
    }
  }

  selectionSort = async (bars, A, N, time) => {
    for (let i = 0; i < N - 1; i++) {
      let min = i

      this.updateBar(bars, A[i], i, PURPLE, N)
      await new Promise(res => setTimeout(res, time))

      for (let j = i + 1; j < N; j++) {
        this.updateBar(bars, A[j], j, RED, N)
        await new Promise(res => setTimeout(res, time))

        if (A[j] < A[min]) {
          if (i === min) {
            this.updateBar(bars, A[i], i, RED, N)
          } else {
            this.updateBar(bars, A[min], min, BLUE, N)
          }
          this.updateBar(bars, A[j], j, PURPLE, N)
          min = j
        } else {
          this.updateBar(bars, A[j], j, BLUE, N)
        }
        await new Promise(res => setTimeout(res, time))
      }

      if (i === min) {
        this.updateBar(bars, A[i], i, BLUE, N)
      } else {
        this.updateBar(bars, A[min], min, RED, N)
        await new Promise(res => setTimeout(res, time))

        const temp = A[i]
        A[i] = A[min]
        A[min] = temp

        this.updateBar(bars, A[i], i, RED, N)
        this.updateBar(bars, A[min], min, RED, N)
        await new Promise(res => setTimeout(res, time))

        this.updateBar(bars, A[i], i, BLUE, N)
        this.updateBar(bars, A[min], min, BLUE, N)
      }
      await new Promise(res => setTimeout(res, time))
    }
  }

  shellSort = async (bars, A, N, time) => {
    for (let gap = Math.floor(N / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < N; i++) {
        for (let j = i - gap; j >= 0; j -= gap) {
          let isSorted = true

          this.updateBar(bars, A[j], j, RED, N)
          this.updateBar(bars, A[j + gap], j + gap, RED, N)
          await new Promise(res => setTimeout(res, time))

          if (A[j] > A[j + gap]) {
            const temp = A[j]
            A[j] = A[j + gap]
            A[j + gap] = temp

            this.updateBar(bars, A[j], j, RED, N)
            this.updateBar(bars, A[j + gap], j + gap, RED, N)

            isSorted = false
            await new Promise(res => setTimeout(res, time))
          }

          this.updateBar(bars, A[j], j, BLUE, N)
          this.updateBar(bars, A[j + gap], j + gap, BLUE, N)
          await new Promise(res => setTimeout(res, time))

          if (isSorted) break
        }
      }
    }
  }

  heapSort = () => {
    const bars = this.state.bars.slice()
    const nums = bars.map(bar => bar.props.num)
    const n = bars.length
    const value = this.state.value
    let time = 0

    const heapify = (end, i) => {
      let max = i
      let l = 2 * i + 1
      let r = l + 1
      let currBar, lBar, rBar

      setTimeout(() => {
        currBar = bars[i].props.num
        this.updateBar(bars, currBar, i, PURPLE, value)
        if (l < end) {
          lBar = bars[l].props.num
          this.updateBar(bars, lBar, l, RED, value)
        }
        if (r < end) {
          rBar = bars[r].props.num
          this.updateBar(bars, rBar, r, RED, value)
        }
      }, time)
      time += this.time(n)

      if (l < end && nums[l] > nums[max]) {
        max = l
      }
      if (r < end && nums[r] > nums[max]) {
        max = r
      }

      setTimeout(() => {
        if (max !== i) {
          let innerTime = this.time(n)
          let maxBar = bars[max].props.num
          this.updateBars(bars, currBar, maxBar, i, max, LIGHT_BLUE, value)

          setTimeout(() => {
            [currBar, maxBar] = [maxBar, currBar]
            this.updateBars(bars, currBar, maxBar, i, max, LIGHT_BLUE, value)
          }, innerTime)
          innerTime += this.time(n)

          setTimeout(() => {
            this.updateBar(bars, currBar, i, RED, value)
            this.updateBar(bars, maxBar, max, PURPLE, value)
          }, innerTime)
        }
      }, time)
      time += this.time(n, max !== i) * 3

      setTimeout(() => {
        currBar = bars[i].props.num
        this.updateBar(bars, currBar, i, BLUE, value)
        if (l < end) {
          lBar = bars[l].props.num
          this.updateBar(bars, lBar, l, BLUE, value)
        }
        if (r < end) {
          rBar = bars[r].props.num
          this.updateBar(bars, rBar, r, BLUE, value)
        }
      }, time)
      time += this.time(n)

      if (max !== i) {
        const temp = nums[i]
        nums[i] = nums[max]
        nums[max] = temp
        heapify(end, max)
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i)
    }

    for (let i = n - 1; i > 0; i--) {
      let firstBar, lastBar
      setTimeout(() => {
        firstBar = bars[0].props.num
        lastBar = bars[i].props.num
        this.updateBars(bars, firstBar, lastBar, 0, i, RED, value)
      }, time)
      time += this.time(n)

      setTimeout(() => {
        [firstBar, lastBar] = [lastBar, firstBar]
        this.updateBars(bars, firstBar, lastBar, 0, i, RED, value)
      }, time)
      time += this.time(n)

      setTimeout(() => {
        this.updateBars(bars, firstBar, lastBar, 0, i, BLUE, value)
      }, time)
      time += this.time(n)

      const temp = nums[0]
      nums[0] = nums[i]
      nums[i] = temp
      heapify(i, 0)
    }

    setTimeout(() => this.finalizeBars(), time)
  }

  // Render Function

  render = () => {
    return (
      <>
        <div>
          {this.state.bars.map(bar => bar)}
        </div>
        <TextContainer value={this.state.value} handleSampleChange={this.handleSampleChange} handleSortClick={this.handleSortClick} handleResetClick={this.handleResetClick} />
      </>
    )
  }
}

// Miscellaneous Functions

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const getBarWidth = (length, spacing) => (100 - spacing * (length - 1)) / length

const getSpacing = () => {
  const spacing = getComputedStyle(document.body).getPropertyValue('--spacing')
  return parseFloat(spacing)
}

const getMaxBarHeight = () => {
  const textContainerHeight = getComputedStyle(document.body).getPropertyValue('--text-container-height')
  return 100 - parseInt(textContainerHeight)
}

