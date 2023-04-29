import {extendType,intArg, nonNull, objectType, stringArg} from "nexus";

export const Comment = objectType({
    name:"Comment",
    definition(t) {
        t.nonNull.id("id");
        t.nonNull.string("text");
        t.nonNull.dateTime("createdAt");
        t.nonNull.int("linkId");
        t.field("postedBy",{
            type:"User",
            resolve(parent,args,context) {
                return context.prisma.link
                    .findUnique({
                        where: {
                            id:parseInt(parent.id)
                        }
                    })
                    .postedBy();
            }
        });
    }
});

export const CommentMutation = extendType({
    type:"Mutation",
    definition(t) {
        t.nonNull.field("comment", {
            type:"Comment",
            args: {
                text:nonNull(stringArg()),
                linkId: nonNull(intArg()),
            },
            resolve(parent,args,context) {
                const {text,linkId} = args;
                const {userId} = context;

                if(!userId) {
                    throw new Error("Cant't comment without logging in!");
                }
                //Connect keyword creates the relation between the 
                //two records instead of creating a new User record.
                const newComment = context.prisma.comment.create({
                    data: {
                        text,
                    },
                });
                return newComment;
            }
        })
    }
});