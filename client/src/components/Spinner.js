import React from 'react';

export default function Spinner({size=40}){
  const s = {width:size, height:size};
  return (
    <div style={{display:'inline-block'}} aria-hidden="true">
      <svg style={s} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" stroke="#f472b6" strokeOpacity="0.25"/>
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
