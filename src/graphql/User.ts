import { extendType, idArg, nonNull, objectType, stringArg} from "nexus";

export const User = objectType({
    name:"User",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name")
        t.nonNull.string("email");
        t.nonNull.string("role", { default :"regular"});
        //non-nullable array of Link type objects.
        t.nonNull.list.nonNull.field("links", {
            type:"Link",
            resolve(parent,args,context) {
                return context.prisma.user
                    .findUnique({where: {id:parent.id}})
                    .links();
            }
        });
        t.nonNull.list.nonNull.field("votes", {
            type:"Link",
            resolve(parent,args,context) {
                return context.prisma.user
                    .findUnique({where: {id:parent.id}})
                    .votes();
            }
        })
    }
});

export const UserQuery = extendType({
    type:"Query",
    definition(t) {
        t.nonNull.field("user", {
            type:"User",
            args: {
                id:nonNull(idArg()),
            },
            async resolve(parent,{id},context){
                const user = await context.prisma.user.findUnique({
                    where: {
                        id:parseInt(id)
                    },
                });
                if(!context.userId) {
                    throw new Error("Cannot query a user without logging in!");
                };
                
                if(!user) {
                    throw new Error(`User with id ${id} not found!`)
                };

                return user;
            }
        })
    }
});

export const UserMutation = extendType({
    type:"Mutation",
    definition(t) {
        t.nonNull.field("updateMe", {
            type:"User",
            args: {
                name:stringArg(),
                email:stringArg(),
            },
            resolve(parent,{name,email},context) {
                let updatedMe = context.prisma.user.update({
                    where: {
                        id:context.userId
                    },
                    data: {
                        name,
                        email
                    }
                });
                return updatedMe;
            }
        }),
        t.nonNull.field("deleteMe", {
            type:"User",
            resolve(parent,args,context) {
                let deletedMe = context.prisma.user.delete({
                    where: {
                        id:context.userId
                    }
                })
                return deletedMe;
            }
        })
    }
});


