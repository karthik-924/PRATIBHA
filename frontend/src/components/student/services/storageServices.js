import { db, storage } from "../../../firebase";
import { ref,uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc,updateDoc } from "firebase/firestore"; 

async function uploadFile(fileObj,course,year,department,section,subject,midNo,email,title){
    let error=null;
    const pra_ref = ref(
        storage,
        `${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`
    );
    await uploadBytes(pra_ref,fileObj)
    .then(async(snapshot) => {
        try {
            let subs=null;
            const docRef = doc(db, "users",email);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                subs = docSnap.data()["subjects"];
                for(var i=0;i<subs.length;i++){
                    if(subs[i].subject===subject){
                        let s=subs[i];
                        s.topic=title
                        s.mid_1=snapshot.ref.fullPath;
                        subs[i]=s;
                    }                
                }
                try {
                    await updateDoc(docRef,{
                        subjects:subs,                        
                    });
                } catch (error) {
                    return error.code;                
                }
            }else{
                return "Student Enrollment Failed";             
            }            
        }catch(error){
            return error.code;            
        }
        console.log('Uploaded a blob or file!');        
        console.log(snapshot.ref.fullPath);        
    })
    .catch((err)=>{
      console.log(err.code);
      error=err;
    })
    return error;
}

async function getUploadedFile(course,year,department,section,subject,midNo,email) {
    let res={
        url:null,
        error:null,    
    }
    console.log(`${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`);
    await getDownloadURL(ref(storage,`${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`))
    .then((url) => {
        console.log(url);
        res.url=url;
    })
    .catch((error) => {
        res.error=error.code;    
    })
    return res;  
}

async function getUploadedFileByPath(path) {
    let res={
        url:null,
        error:null,    
    }
    await getDownloadURL(ref(storage,path))
    .then((url) => {
        console.log(url);
        res.url=url;
    })
    .catch((error) => {
        res.error=error.code;    
    })
    return res;  
}

export {uploadFile,getUploadedFile,getUploadedFileByPath}