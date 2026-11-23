import{mkdirSync as m,readdirSync as L,readFileSync as f,writeFileSync as w}from"node:fs";
const U="\"3c&(,-1!!!!!!!!+++++++'+++'+++!+++!!!!!!!!!!!!!BFFB\"!!!!!!!!!!!'*!!!!!!!!!!!!!!&&#&";
function R(p,q){
const S=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),O=new Uint8Array(65536);
let a=0,b=0,c=0,e=0,g=0,h=0;
const E=x=>[O.slice(0,g),x];
for(;;){
if(e==1e6)return E(10);
if(c<0||c>=p.length)return E(9);
const o=p[c],v=(U.charCodeAt(o)||33)-34;
if(v<0)return E(5);
const i=v>>4,n=(v>>2)&3,t=v&3;
if(c+i>=p.length)return E(9);
e++;
const y=c+1+i;
if(a<n)return E(2);
if(a-n+t>256)return E(3);
c=y;
if(o==0)return E(0);
else if(o==1)S[a++]=(p[y-1]<<24)>>24;
else if(o==2)S[a++]=p[y-4]|p[y-3]<<8|p[y-2]<<16|p[y-1]<<24;
else if(o==3)a--;
else if(o==4){S[a]=S[a-1];a++}
else if(o==5){const z=S[a-1];S[a-1]=S[a-2];S[a-2]=z}
else if(o==6){S[a]=S[a-2];a++}
else if(o==7){const z=S[a-3];S[a-3]=S[a-2];S[a-2]=S[a-1];S[a-1]=z}
else if(o==23)S[a-1]=-S[a-1];
else if(o==27)S[a-1]=~S[a-1];
else if(o>=16&&o<=34){
const B=S[a-1],A=S[a-2];let r;
if(o<19)r=o==16?A+B:o==17?A-B:Math.imul(A,B);
else if(o<23){if(B==0)return E(4);r=o==19?A/B:o==20?A%B:o==21?(A>>>0)/(B>>>0):(A>>>0)%(B>>>0)}
else if(o<28)r=o==24?A&B:o==25?A|B:A^B;
else if(o<32)r=o==28?A<<(B&31):o==29?A>>(B&31):A>>>(B&31);
else r=o==32?A==B?1:0:o==33?A<B?1:0:(A>>>0)<(B>>>0)?1:0;
a-=2;S[a++]=r}
else if(o>=48&&o<=50){
const z=(p[y-2]|p[y-1]<<8)<<16>>16,j=o==48?0:S[--a];
if((o==48||o==49)?j==0:j!=0)c=y+z}
else if(o==51){if(b==64)return E(7);C[b++]=y;c=p[y-2]|p[y-1]<<8}
else if(o==52){if(b==0)return E(8);c=C[--b]}
else if(o==64){const z=S[a-1];if(z<0||z>=256)return E(6);S[a-1]=M[z]}
else if(o==65){const z=S[a-1],x=S[a-2];if(z<0||z>=256)return E(6);a-=2;M[z]=x}
else if(o==80){const t=S[a-1]+"";if(g+t.length>65536)return E(11);a--;for(let k=0;k<t.length;)O[g++]=t.charCodeAt(k++)}
else if(o==81){if(g>65535)return E(11);O[g++]=S[--a]&255}
else if(o==82)S[a++]=h<q.length?q[h++]:-1;
else return E(S[--a]&255)
}
}
const I=process.env.MAKEFUN_INPUT_DIR??"/input",T=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const d of L(I).sort()){const p=I+"/"+d+"/",t=R(f(p+"program.bin"),f(p+"input.bin")),o=T+"/"+d+"/";m(o,{recursive:!0});w(o+"stdout.bin",t[0]);w(o+"exit.txt",t[1]+"\n")}
