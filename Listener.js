// in one update process it only func once 
// to use when a func bind many values
function getFuncOnce(fn){
  fn.dirty=false;
  return ()=>{
    if(!fn.dirty){
      fn.dirty=true;
      fn();
      setTimeout(()=>{fn.dirty=false});
    }
  }
}
export class Listener {
  constructor() {
    this.all=[];
    this.dirty=[];
  }
  start(){
    let start=()=>{
      if(this.update())requestAnimationFrame(start);
    }
    this.animationFrame=requestAnimationFrame(start);
  }
  destroy(){
    this.clear();
    this.all=this.dirty=null;
  }
  trigger(obj,id){
    obj=obj ? (obj instanceof Array ? obj : [obj]) : obj;
    id=id ? (id instanceof Array ? id : [id]) : id;
    let objArr=this.all.filter(item=>!obj || obj.includes(item.src));
    objArr.forEach(item=>{
      let data=item.data;
      id = id || Object.keys(data);
      id.forEach(n=>{
        let value=data[n].value;
        data[n].list.forEach(fn=>fn(value,value));
      });
    })
  }
  clear(obj,id){
    obj=obj ? (obj instanceof Array ? obj : [obj]) : obj;
    id=id ? (id instanceof Array ? id : [id]) : id;
    let objArr=this.all.filter(item=>!obj || obj.includes(item.src));
    objArr.forEach(item=>{
      let data=item.data;
      id = id || Object.keys(data);
      id.forEach(n=>{
          let obj=item.src;
          delete obj[n];
          obj[n]=data[n].value;
          delete data[n].value;
          delete data[n].list;
          delete data[n];
      });
      if(Object.keys(item.data).length==0){
        delete item.data;
        delete item.src;
        let ii=this.all.indexOf(item);
        if(ii!=-1)this.all.splice(ii,1);
      }
    })
  }
  update(){
    if(this.dirty===null)return false;
    if(this.dirty.length==0)return true;
    this.dirty.forEach((data)=>{
      data.dirty=false;
      data.list.forEach(fn=>fn(data.value,data.oldValue));
    });
    this.dirty=[];
    return true;
  }
  _addListener(obj,id,data){
    Object.defineProperty(obj,id,{
      configurable:true,
      get(){
        return data.value;
      },
      set:(v)=>{
        if(v!=data.value){
          if(!data.dirty){
            data.dirty=true;
            data.oldValue=data.value;
            this.dirty.push(data);
          }
          data.value=v;
        }
      },
    })
  }
  listen(obj,id,fn){
    if(id instanceof Array){ //id 为数组表明 在数组里任意id元素改变后 执行fn
      fn=getFuncOnce(fn);
      return id.forEach(_id=>this.listen(obj,_id,fn));
    }
    var choose;
    let i=this.all.findIndex(item=>item.src===obj);
    if(i==-1){
      choose={
        src:obj,
        data:{},
      }
      this.all.push(choose);
    }
    else choose=this.all[i];
    const data = choose.data;
    if(!data[id]){
      data[id]={value:obj[id],list:[fn],dirty:false};
      this._addListener(obj,id,data[id]);
    }
    else data[id].list.push(fn);
  }
}