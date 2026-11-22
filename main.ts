import{mkdirSync as m,readdirSync as L,readFileSync as f,writeFileSync as w}from"node:fs";
const s=o=>o==0?0:o==1?17:o==2?65:o==3?4:o==4?6:o==5?10:o==6?11:o==7?15:o<16?-1:o<23?9:o==23?5:o<27?9:o==27?5:o<31?9:o==31?-1:o<35?9:o<48?-1:o==48?32:o<51?36:o==51?32:o==52?0:o<64?-1:o==64?5:o==65?8:o<80?-1:o==80||o==81?4:o==82?1:o==83?4:-1;
function R(p,q){
const S=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),O=new Uint8Array(1<<16);
let a=0,b=0,c=0,e=0,g=0,h=0;
const E=x=>[O.slice(0,g),x];
for(;;){
if(e==1e6)return E(10);
if(c<0||c>=p.length)return E(9);
const o=p[c],v=s(o);
if(v<0)return E(5);
const i=v>>4,n=(v>>2)&3,t=v&3;
if(c+i>=p.length)return E(9);
e++;
const y=c+1+i;
if(a<n)return E(2);
if(a-n+t>256)return E(3);
c=y;
if(o==0)return E(0);
if(o==1){S[a++]=(p[y-1]<<24)>>24;continue}
if(o==2){S[a++]=p[y-4]|p[y-3]<<8|p[y-2]<<16|p[y-1]<<24;continue}
if(o==3){a--;continue}
if(o==4){S[a]=S[a-1];a++;continue}
if(o==5){const z=S[a-1];S[a-1]=S[a-2];S[a-2]=z;continue}
if(o==6){S[a]=S[a-2];a++;continue}
if(o==7){const z=S[a-3];S[a-3]=S[a-2];S[a-2]=S[a-1];S[a-1]=z;continue}
if(o==23){S[a-1]=-S[a-1]|0;continue}
if(o==27){S[a-1]=~S[a-1];continue}
if(o>=16&&o<=34){
const B=S[a-1],A=S[a-2];let r;
if(o==16)r=A+B|0;
else if(o==17)r=A-B|0;
else if(o==18)r=Math.imul(A,B);
else if(o==19){if(B==0)return E(4);r=A==-2147483648&&B==-1?A:A/B|0}
else if(o==20){if(B==0)return E(4);r=B==-1?0:A%B|0}
else if(o==21){if(B==0)return E(4);r=Math.floor((A>>>0)/(B>>>0))|0}
else if(o==22){if(B==0)return E(4);r=(A>>>0)%(B>>>0)|0}
else if(o==24)r=A&B;
else if(o==25)r=A|B;
else if(o==26)r=A^B;
else if(o==28)r=A<<(B&31);
else if(o==29)r=A>>(B&31);
else if(o==30)r=(A>>>(B&31))|0;
else if(o==32)r=A==B?1:0;
else if(o==33)r=A<B?1:0;
else r=(A>>>0)<(B>>>0)?1:0;
a-=2;S[a++]=r;continue}
if(o>=48&&o<=50){
const z=(p[y-2]|p[y-1]<<8)<<16>>16;let u=!0;
if(o!=48){const j=S[--a];u=o==49?j==0:j!=0}
if(u)c=y+z;continue}
if(o==51){if(b==64)return E(7);C[b++]=y;c=p[y-2]|p[y-1]<<8;continue}
if(o==52){if(b==0)return E(8);c=C[--b];continue}
if(o==64){const z=S[a-1];if(z<0||z>=256)return E(6);S[a-1]=M[z];continue}
if(o==65){const z=S[a-1],x=S[a-2];if(z<0||z>=256)return E(6);a-=2;M[z]=x;continue}
if(o==80){const t=""+S[a-1];if(g+t.length>65536)return E(11);a--;for(let k=0;k<t.length;)O[g++]=t.charCodeAt(k++);continue}
if(o==81){if(g>65535)return E(11);O[g++]=S[--a]&255;continue}
if(o==82){S[a++]=h<q.length?q[h++]:-1;continue}
return E(S[--a]&255)
}
}
const I=process.env.MAKEFUN_INPUT_DIR??"/input",T=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const d of L(I).sort()){const t=R(f(I+"/"+d+"/program.bin"),f(I+"/"+d+"/input.bin"));m(T+"/"+d,{recursive:!0});w(T+"/"+d+"/stdout.bin",t[0]);w(T+"/"+d+"/exit.txt",t[1]+"\n")}
