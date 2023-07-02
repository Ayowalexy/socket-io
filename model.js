import mongoose from "mongoose";
const Schema = mongoose.Schema;


const schema = new Schema({
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'message'
    }],
    name: String
})

const messageSchema = new Schema({
    message: String,
    sender: String,
    receiver: String,
    users: [{type: String}]
}, { timestamps: true})

const User = mongoose.model('user', schema)
const Messsage = mongoose.model('message', messageSchema);

export {
    Messsage,
    User
}