import { NexusGenObjects } from './../../nexus-typegen';
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

let links: NexusGenObjects["Link"] = [
    {
        id: "1",
        url: "www.graphql.com",
        description: "GraphQL Practice" 
    },
    {
        id: "2",
        url: "www.aaronswartz.com",
        description: "Aaron Swartz"
    }
]

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", { 
            type: "Link",
            resolve(parent, args, context, info) {
                return links;
            },
        }),
        t.nonNull.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },
            resolve(parent, { id }, context, info) {
                return links.find((link) => link.id === id);
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
            resolve(parent, {url,description}, context, info) {
                let id = String(links.length + 1);
                const link = {
                    id,
                    description,
                    url
                };
                links.push(link);
                return link;
            }
        }),
        t.nonNull.field("delete", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },
            resolve(parent, { id }, context, info) {
                let link = links.find((link) => link.id === id);
                links = links.filter((link) => link.id !== id);
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
                let link = links.find((link) => link.id === id);
                link.url = url
                link.description = description
                return link
            }
        })
    }
});