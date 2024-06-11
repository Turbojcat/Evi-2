// src/placeholders.js
module.exports = {
    replacePlaceholders: (member, message) => {
      return message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{discriminator}/g, member.user.discriminator)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount)
        .replace(/{inviter}/g, member.guild.invites.resolveId(member.guild.invites.cache.find(invite => invite.uses > 0 && invite.inviter && invite.inviter.id !== member.client.user.id)?.inviter?.id)?.toString() || 'Unknown')
        .replace(/{inviteCode}/g, member.guild.invites.cache.find(invite => invite.uses > 0 && invite.inviter && invite.inviter.id !== member.client.user.id)?.code || 'Unknown')
        .replace(/{inviteURL}/g, member.guild.invites.cache.find(invite => invite.uses > 0 && invite.inviter && invite.inviter.id !== member.client.user.id)?.url || 'Unknown')
        .replace(/{joinedAt}/g, member.joinedAt.toDateString())
        .replace(/{joinedTimestamp}/g, member.joinedTimestamp)
        .replace(/{premiumSince}/g, member.premiumSince ? member.premiumSince.toDateString() : 'N/A')
        .replace(/{premiumTimestamp}/g, member.premiumSinceTimestamp || 'N/A')
        .replace(/{createdAt}/g, member.user.createdAt.toDateString())
        .replace(/{createdTimestamp}/g, member.user.createdTimestamp)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{avatarURL}/g, member.user.displayAvatarURL({ dynamic: true }))
        .replace(/{serverIcon}/g, member.guild.iconURL({ dynamic: true }))
        .replace(/{serverOwner}/g, member.guild.owner ? member.guild.owner.user.tag : 'Unknown')
        .replace(/{serverRegion}/g, member.guild.region)
        .replace(/{serverVerificationLevel}/g, member.guild.verificationLevel);
    },
  };
  