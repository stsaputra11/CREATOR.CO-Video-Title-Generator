
const SOCIAL_HASHTAG_SIGNALS=[
 "lofi","lofihiphop","lofibeats","chill","chillbeats","relaxingmusic","sleepmusic",
 "studymusic","focusmusic","workmusic","ambientmusic","rain","rainsounds","rainymood",
 "piano","pianomusic","healingmusic","calmingmusic","lullaby","babysleep","musicbox",
 "jazz","bossanova","acoustic","guitar","meditationmusic","flutemusic","deephouse",
 "melodictechno","nightvibes","cozyvibes","relaxing","sleep","study","focus","meditation"
];

function hashtagPhrase(value){
 return String(value||"")
   .normalize("NFKC")
   .toLowerCase()
   .replace(/&/g," and ")
   .replace(/[^\p{L}\p{N}\s]/gu," ")
   .replace(/\s+/g," ")
   .trim();
}

function hashtagKey(value){
 return hashtagPhrase(value).replace(/\s+/g,"");
}

function hashtagSocialScore(value){
 const phrase=hashtagPhrase(value);
 const key=hashtagKey(value);
 if(!phrase || !key) return -999;

 let score=0;
 const words=phrase.split(" ").filter(Boolean);

 // Relevance-friendly shape: concise hashtags tend to be easier to read/use.
 if(words.length===1) score+=18;
 else if(words.length===2) score+=26;
 else if(words.length===3) score+=18;
 else if(words.length===4) score+=8;
 else score-=10;

 // Familiar social / YouTube music phrasing.
 for(const signal of SOCIAL_HASHTAG_SIGNALS){
   if(key===signal) score+=28;
   else if(key.includes(signal) || signal.includes(key)) score+=10;
 }

 // Strong music/content intent.
 if(/\b(music|lofi|beats|piano|jazz|guitar|lullaby|flute|house|techno|rain|sleep|study|focus|relax|meditation|ambient|vibes)\b/.test(phrase)) score+=12;

 // Avoid overly generic or spam-like tags.
 if(/^(music|video|youtube|viral|fyp|trending)$/i.test(phrase)) score-=30;

 // Readability / memorability heuristic.
 if(key.length>=5 && key.length<=22) score+=12;
 else if(key.length>30) score-=14;

 return score;
}

function buildDescriptionHashtags(mainKeyword,relatedKeywords){
 const main=hashtagPhrase(mainKeyword);
 const mainTokens=new Set(main.split(" ").filter(Boolean));
 const candidates=[];

 function addCandidate(value,bonus=0){
   const phrase=hashtagPhrase(value);
   if(!phrase) return;
   const key=hashtagKey(phrase);
   if(!key) return;

   const tokens=phrase.split(" ").filter(Boolean);
   const overlap=tokens.filter(t=>mainTokens.has(t)).length;
   const relevance=mainTokens.size ? overlap/mainTokens.size : 0;

   // Must stay meaningfully related to Main Keyword.
   if(relevance===0 && phrase!==main) return;

   const score=
     hashtagSocialScore(phrase) +
     Math.round(relevance*45) +
     bonus;

   candidates.push({phrase,key,score});
 }

 // Main Keyword always gets strongest relevance priority.
 addCandidate(main,50);

 // Related Keywords are primary expansion source.
 (relatedKeywords||[]).forEach((kw,i)=>{
   addCandidate(kw,Math.max(0,18-i*2));
 });

 // Create concise social-style combinations from Main Keyword tokens.
 const mainWords=main.split(" ").filter(Boolean);
 if(mainWords.length>=2){
   for(let i=0;i<mainWords.length;i++){
     for(let j=i+1;j<mainWords.length;j++){
       addCandidate(`${mainWords[i]} ${mainWords[j]}`,14);
     }
   }
 }

 // Single strong topic tokens are allowed only when clearly meaningful.
 for(const w of mainWords){
   if(w.length>=4 && !/^(music|video|audio|sound)$/i.test(w)){
     addCandidate(w,6);
   }
 }

 // Rank + dedupe.
 const bestByKey=new Map();
 for(const c of candidates){
   const prev=bestByKey.get(c.key);
   if(!prev || c.score>prev.score) bestByKey.set(c.key,c);
 }

 const ranked=[...bestByKey.values()]
   .sort((a,b)=>b.score-a.score)
   .slice(0,5);

 return ranked.map(x=>{
   const pascal=x.phrase.split(" ").filter(Boolean)
     .map(w=>w.charAt(0).toUpperCase()+w.slice(1))
     .join("");
   return "#"+pascal;
 });
}

const tests=[
 ["tokyo rain lofi",["rainy tokyo lofi","tokyo rain ambience","tokyo night lofi","lofi rain beats","tokyo chill beats"]],
 ["sleep rain",["rain sleep music","deep sleep rain","bedtime rain sounds","relaxing rain ambience","sleeping rain"]],
 ["gentle piano",["healing piano music","calming piano","gentle piano ambience","peaceful piano music","piano relaxation"]]
];
for(const [main,rel] of tests){
 console.log(main,"=>",buildDescriptionHashtags(main,rel).join(" "));
}
