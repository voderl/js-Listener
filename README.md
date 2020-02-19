# js-Listener
a listener like js-Observer

### 一个非常简单粗暴的Listener模块，大概100行代码，使用es6

## 具体实现
  通过get set 挟持数据 ，如果发生变化则将数据记录为dirty
  加入dirty数组，dirty数组会通过animationFrame刷新,取消dirty
### 开始
```javascript
const l=new Listener();
l.start();//start AnimationFrame
// you can also just use l.update() to update; 
```
### 测试
```javascript
const a={};
a.listened=0;
l.listen(a,'listened',(newValue,oldValue)=>
  console.log(newValue,oldValue));
a.listened=1; // console.log : 1 0
a.listened=1; // don't console

for(let i=0;i<1000000;i++){
  a.listened+=1;
} // console.log :  1000001 1

a.a=a.b=a.c=a.d=0;
l.listen(a,['a','b','c','d'],()=>
console.log('at least one changed'));

for(let i=0;i<1000000;i++){
  a.a+=1;
} // console.log : at least one change
for(let i=0;i<1000000;i++){
  a.b+=1;
  a.c+=1;
}// console.log : at least one change

l.clear() //remove listener  
//{get a: 0,set a:func...} => {a:0} 
//you can use l.clear(a) to just remove a
l.destroy();//clearAll and remove animationFrame
```
### 效率
不知为何，使用同样的代码测试，有时忽然费时爆炸，不是很懂
```javascript
a.listened=0;a.normal=0;
for(let i=0;i<100000000;i++){
  a.listened++;
}//listened: 284.919921875ms

for(let i=0;i<100000000;i++){
  a.normal++;
}//normal: 254.739990234375ms

a.listened=0;a.normal=0;

for(let i=0;i<100000000;i++){
  a.listened;
}//listened: 69.05517578125ms

for(let i=0;i<100000000;i++){
  a.normal;
}//normal: 64.030029296875ms
```
#### 总结
非常简单粗暴，在学习pixi的过程中，想要用pixi更新一个别人写的js（dom+canvas）游戏，而又希望能用listen监听数据变化来实现响应改变。而一些数据又可能在一组代码中多次改变，想要只执行一次。从而出现了这种畸形写法 （捂脸逃
最初是用setTimeOut实现的，下一次执行取消上一次的setTimeOut，即debounce，但是自己尝试了一下，感觉性能不太好。
