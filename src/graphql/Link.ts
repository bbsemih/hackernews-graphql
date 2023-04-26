import { Prisma } from '@prisma/client';
import { extendType,objectType,nonNull,stringArg, idArg, intArg, arg, inputObjectType,enumType,list } from 'nexus';

//LinkOrderByInput represents the criteria by which that the list of Link elements can be sorted. 
//The Sort enum is used to define the sorting order.
export const LinkOrderByInput = inputObjectType({
    name:"LinkOrderByInput",
    definition(t) {
        t.field("description",{type:Sort});
        t.field("url",{type: Sort });
        t.field("createdAt",{type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Link = objectType({
    name: "Link",//name of the type
    definition(t) {
        t.nonNull.id("id");
        t.nonNull.string("url");
        t.nonNull.string("description");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type:"User",
            resolve(parent,args,context) {
                return context.prisma.link
                    .findUnique({where: {id:parseInt(parent.id)}})
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type:"User",
            resolve(parent,args,context) {
                return context.prisma.link
                    .findUnique({where: {id:parseInt(parent.id)}})
                    .voters();
            }
        })
    }
});

export const Feed = objectType({
    name:"Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links",{type:Link});
        t.nonNull.int("count");
        t.id("id")
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", { 
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            async resolve(parent, args, context) {
                const where = args.filter
                ? {
                    OR: [
                        {description: {contains: args.filter}},
                        {url: {contains: args.filter}},
                    ],
                }
                : {};
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,
            });

            const count = await context.prisma.link.count({where});
            const id = `main-feed:${JSON.stringify(args)}`;

            return{
                links,
                count,
                id,
                };
            },
        });
    },
});


export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post",{
            type: "Link",
            args: {
                url: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            resolve(parent, args, context, info) {
                const {description,url} = args;
                const {userId} = context;
                if(!userId) {
                    throw new Error("Cannot post without logging in!")
                }
                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: {connect:{id:userId}}
                    },
                });
                return newLink;
            },
        }),
        t.nonNull.field("delete", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },
            resolve(parent,{id} , context, info) {
                let link = context.prisma.link.delete({
                    where: {id:parseInt(id)}
                })
                return link;
            }
        }),
        t.nonNull.field("update", {
            type:"Link",
            args: {
                id: nonNull(idArg()),
                url:stringArg(),
                description:stringArg()
            },
            resolve(parent,{id,url,description},context,info) {
                let updatedLink = context.prisma.link.update({
                    where: {
                        id:parseInt(id)
                    },
                    data: {
                        url,
                        description
                    },
                });
                return updatedLink;
            }
        })
    }
});