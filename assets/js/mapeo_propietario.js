// ================================================================
// MAPEO PROPIETARIO
// ================================================================
const MAPEO_TIPO_PROPIETARIO={'Asociaciones':'Persona moral','Comunidades':'Comunidad (Bienes comunales)','Ejido (Tierras de Uso Común)':'Ejido (Tierras de Uso Común)','Empresas de Participación Estatal':'Empresa de Participación Estatal','Estatal':'Público Estatal','Federal':'Público Federal','Municipal':'Público Municipal','Parcelas':'Ejido (Parcela)','Persona Física':'Persona física','Personas Físicas':'Persona física','Personas físicas':'Persona física','Persona Moral':'Persona moral','Prop publico_municipal':'Público Municipal','Prop. Privada_ Persona física':'Persona física','Prop.Privada_Persona moral':'Persona moral','Prop.Social_Comunidad_TUC':'Comunidad (Bienes comunales)','Prop.Social_Ejido_Parcela':'Ejido (Parcela)','Prop.Social_Ejido_TUC':'Ejido (Tierras de Uso Común)','Propiedad Federal Personales Morales Públicas (FINABIEN)':'Propiedad pública','Propiedad Privada':'Persona moral','Propiedad Social Comunidad (Bienes comunales)':'Comunidad (Bienes comunales)','Propiedad Social Ejido (Tierras de Uso Común)':'Ejido (Tierras de Uso Común)','Propiedad social':'Ejido (Tierras de Uso Común)','Pública Estatal':'Público Estatal','Público-Centralizado Federal':'Público Federal','Público-Descentralizado Estatal':'Público Estatal','Público-Descentralizado Federal':'Público Federal','Sociedades':'Persona moral','Tierras de Uso Común':'Ejido (Tierras de Uso Común)','Tierras de Uso Común y Parcelas':'Ejido (Tierras de Uso Común y Parcelas)'};
function estandarizarTipoPropietario(v){if(!v)return'Otros';const s=String(v).trim();if(MAPEO_TIPO_PROPIETARIO[s])return MAPEO_TIPO_PROPIETARIO[s];for(const[k,m]of Object.entries(MAPEO_TIPO_PROPIETARIO)){if(s.includes(k)||k.includes(s))return m;}return s;}
function agruparPropiedad(c){const soc=['Ejido (Tierras de Uso Común)','Comunidad (Bienes comunales)','Ejido (Tierras de Uso Común y Parcelas)','Ejido (Parcela)','Tierras de Uso Común','Tierras de uso común','Comunidades','Prop.Social_Ejido_Parcela','Prop.Social_Ejido_TUC','Parcelas','Tierras de Uso Común y Parcelas','Prop.Social_Comunidad_TUC','Propiedad Social Comunidad (Bienes comunales)','Propiedad Social Ejido (Tierras de Uso Común)','Propiedad social'];const pri=['Persona física','Persona moral','Empresa de Participación Estatal','Empresas de Participación Estatal','Personas Físicas','Sociedades','Asociaciones','Propiedad privada','Prop.Privada_Persona moral','Prop. Privada_ Persona física','Propiedad privada_ Persona física','Propiedad privada_ Persona moral','Propiedad privada_Persona Moral','Propiedad privada_Persona Física'];const pub=['Público Federal','Público Estatal','Público Municipal','Propiedad pública','Municipal','Federal','Estatal','Público-Descentralizado Estatal','Público-Descentralizado Federal','Público-Centralizado Federal','Pública Estatal','Prop publico_municipal','Propiedad Federal Personales Morales Públicas (FINABIEN)'];if(soc.includes(c))return'Social';if(pri.includes(c))return'Privada';if(pub.includes(c))return'Pública';return'Otros';}
function clasificarPropiedadDetalle(raw){
 if(!raw) return 'Otros';
 const s=String(raw).trim();
 const lo=s.toLowerCase();
 if(lo.includes('tierras de uso com') ) return 'Tierras de uso común';
 if(lo.includes('propiedad privada') && lo.includes('moral')) return 'Propiedad privada_ Persona moral';
 if(lo.includes('propiedad privada') && (lo.includes('física')||lo.includes('fisica'))) return 'Propiedad privada_ Persona física';
 if(lo.includes('prop. privada') && lo.includes('moral')) return 'Propiedad privada_ Persona moral';
 if(lo.includes('prop. privada') && (lo.includes('física')||lo.includes('fisica'))) return 'Propiedad privada_ Persona física';
 const est=estandarizarTipoPropietario(s);
 const grp=agruparPropiedad(est);
 if(grp==='Social') return 'Tierras de uso común';
 if(grp==='Privada'){
   if(lo.includes('moral')) return 'Propiedad privada_ Persona moral';
   if(lo.includes('física')||lo.includes('fisica')) return 'Propiedad privada_ Persona física';
   return est;
 }
 return grp;
}