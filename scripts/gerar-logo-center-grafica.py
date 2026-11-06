import re,sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
FONT=sys.argv[1] if len(sys.argv)>1 else 'fonts/Orbitron.ttf'; WG=float(sys.argv[2]) if len(sys.argv)>2 else 900
f=TTFont(FONT)
if 'fvar' in f: f=instantiateVariableFont(f,{'wght':WG})
gs=f.getGlyphSet(); cmap=f.getBestCmap(); hmtx=f['hmtx']
def run(text,track=0):
    items=[];x=0
    for ch in text:
        g=cmap[ord(ch)]; items.append((g,x)); x+=hmtx[g][0]+track
    bp=BoundsPen(gs)
    for g,ox in items: gs[g].draw(TransformPen(bp,(1,0,0,1,ox,0)))
    return items,bp.bounds
def path(items,box):
    (gx0,gy0,gx1,gy1)=box[1]; X,Y,Wd,Ht=box[0]
    sx=Wd/(gx1-gx0); sy=Ht/(gy1-gy0)
    pen=SVGPathPen(gs,ntos=lambda v:('%.2f'%v).rstrip('0').rstrip('.'))
    for g,ox in items:
        gs[g].draw(TransformPen(pen,(sx,0,0,-sy,X+(ox-gx0)*sx,Y+gy1*sy)))
    return pen.getCommands()
c_items,c_b=run('CENTER'); g_items,g_b=run('gráfica')
K=0.8
pc=path(c_items,((142+K,31+K,215-2*K,30-2*K),c_b)); pg=path(g_items,((215.25,67.25,144.5,26.5),g_b))
sym=open(sys.argv[3] if len(sys.argv)>3 else 'simbolo.svg',encoding='utf-8').read()
inner=re.search(r'<svg[^>]*>(.*)</svg>',sym,re.S).group(1)
inner=re.sub(r'<!--.*?-->','',inner,flags=re.S)
SX=67/100
out=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="56 4 312 98" role="img" aria-label="Center Gráfica">
  <!-- Redesenho da logo (sem vetor original). Símbolo = simbolo-center.svg; letras = fonte Orbitron (OFL) convertida em curvas e ajustada à referência. -->
  <g transform="translate(63 7.5) scale({SX})">{inner}</g>
  <path fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round" d="{pc}"/>
  <path fill="#111111" stroke="#111111" stroke-width="0.5" stroke-linejoin="round" d="{pg}"/>
</svg>
'''
open(sys.argv[4] if len(sys.argv)>4 else 'logo-v2.svg','w',encoding='utf-8').write(out); print('ok',c_b,g_b)
