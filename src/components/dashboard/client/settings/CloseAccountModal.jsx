import React,{useState} from "react";
import {X} from "lucide-react";

const CloseAccountModal = ({close}) => {

const [reason,setReason] = useState("");

return(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl w-[650px] p-10 relative">

<button
onClick={()=>close(false)}
className="absolute right-6 top-6"
>
<X/>
</button>

<h2 className="text-3xl font-semibold mb-6">
Close account
</h2>

<p className="mb-6">
Leaving so soon? We hate to see you go.
</p>

<h3 className="mb-4">
Select a reason for leaving
</h3>

<div className="space-y-3">

<label>
<input
type="radio"
name="reason"
value="quality"
onChange={(e)=>setReason(e.target.value)}
/>
 I am not satisfied with freelancers
</label>

<label>
<input
type="radio"
name="reason"
value="username"
/>
 I want to change username
</label>

<label>
<input
type="radio"
name="reason"
value="wrong"
/>
 Wrong account type
</label>

</div>

<div className="flex justify-end gap-4 mt-8">

<button
onClick={()=>close(false)}
className="text-green-600"
>
Cancel
</button>

<button className="bg-green-600 text-white px-6 py-2 rounded-lg">
Close account
</button>

</div>

</div>

</div>

);

};

export default CloseAccountModal;