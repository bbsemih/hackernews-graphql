import { prisma } from './../context';
import { NexusGenObjects, NexusGenArgTypes } from './../../nexus-typegen';
import { extendType,objectType,nonNull,stringArg, idArg } from 'nexus';
//defining a new Link type that represents the links that can be posted to Hacker News.

export const Link = objectType({
    name: "Link",//name of the type
    definition(t) {
        t.nonNull.id("id");
        t.nonNull.string("url");
        t.nonNull.string("description");
    }
})

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", { 
            type: "Link",
            resolve(parent, args, context, info) {
                return context.prisma.link.findMany();
            },
        }),
        t.nonNull.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },
            resolve(parent, { id }, context, info) {
                return context.prisma.link.findUnique({
                    where: {id:parseInt(id)}
                });
            }
        })
    },
});


export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post",{
            type: "Link",
            args: {
                url: nonNull(stringArg()),
                description: nonNull(stringArg())
            },
            resolve(parent, args, context, info) {
                const newLink = context.prisma.link.create({
                    data: {
                        description:args.description,
                        url:args.url
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