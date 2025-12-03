import { useState } from "react";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import { useAuth } from "../../contexts/AuthContext";  

export default function Transactions() {
  const { createTransaction } = useAuth();   
  
  const [utorid, setUtorid] = useState("");
  const [spent, setSpent] = useState("");
  const [promotionIds, setPromotionIds] = useState([]);
  const [remark, setRemark] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const type = "purchase";
    
    // Convert spent to number
    const spentNum = parseFloat(spent);
    if (isNaN(spentNum) || spentNum <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    
    // Convert promotionIds to number array
    const promotionIdsNum = promotionIds
      .map(id => id.trim())
      .filter(id => id !== "")
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
    
    const err = await createTransaction(utorid, type, spentNum, promotionIdsNum, remark); 

    if (err){
        alert(err);
        return;
    }

    // Success - reset form
    setUtorid("");
    setSpent("");
    setPromotionIds([]);
    setRemark("");
    alert("Transaction created successfully!");
  };

  return (
    <form onSubmit={submit}>
      <h1>Create Transaction</h1>

      <Input
        label="UTORid"
        placeholder="Enter your UTORid"
        value={utorid}
        onChange={(value) => setUtorid(value)}
        required
      />

      <Input
        label="Amount Spent"
        placeholder="Enter the amount spent"
        type="number"
        step="0.01"
        value={spent}
        onChange={(value) => setSpent(value)}
        required
      />

    <Input
        label="promotionIds"
        placeholder="Enter the promotion IDs"
        value={promotionIds.join(",")}
        onChange={(value) => setPromotionIds(value ? value.split(",") : [])}
      />

    <Input
        label="Remark"
        placeholder="Enter the remark"
        value={remark}
        onChange={(value) => setRemark(value)}
      />

      <Button type="submit">Create Transaction</Button>
    </form>
  );
}
